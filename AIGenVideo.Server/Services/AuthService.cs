using AIGenVideo.Server.Helpers;
using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.ResponseModels.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Web;

namespace AIGenVideo.Server.Services;

public class AuthService : IAuthService
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;
    private readonly IEmailSender _emailSender;

    public AuthService(SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, ITokenService tokenService, IOptions<JwtOptions> options, ILogger<AuthService> logger, IEmailSender emailSender)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtOptions = options.Value;
        _logger = logger;
        _emailSender = emailSender;
    }

    public async Task<ApiResponse<ForgotPasswordResponse>> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return ApiResponse<ForgotPasswordResponse>.FailResponse("Email not found.");
            }
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);

            var resetLink = $"{request.CallbackUrl}?email={user.Email}&token={encodedToken}";

            var sendEmailResutl = await _emailSender.SendResetPasswordEmailAsync(request.Email, resetLink);

            if (!sendEmailResutl.Success)
            {
                _logger.LogError("Failed to send reset password email to {Email}: {Error}", request.Email, sendEmailResutl.Message);
                return ApiResponse<ForgotPasswordResponse>.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
            }

            return ApiResponse<ForgotPasswordResponse>.SuccessResponse(new ForgotPasswordResponse
            {
                Email = request.Email,
            }, "If the email exists, a reset link has been sent.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during forgot password for email: {Email}", request.Email);
            return ApiResponse<ForgotPasswordResponse>.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }



    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
    {
        try
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.UserName == request.Email);
            if (user == null)
            {
                return ApiResponse<LoginResponse>.FailResponse("Invalid username!");
            }
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                return ApiResponse<LoginResponse>.FailResponse("Username not found and/or password incorrect");
            }

            var refreshToken = TokenHelper.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(_jwtOptions.RefeshTokenExpirationInMinutes);
            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);

            return ApiResponse<LoginResponse>.SuccessResponse(new LoginResponse
            {
                Username = user.UserName ?? string.Empty,
                Token = _tokenService.CreateToken(user),
                RefreshToken = refreshToken,
                Role = roles.FirstOrDefault() ?? Constants.USER_ROLE,
            }, "Login successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during user login for email: {Email}", request.Email);
            return ApiResponse<LoginResponse>.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }
    }

    [Authorize]
    public async Task<ApiResponse<object>> LogoutAsync(string username)
    {
        try
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return ApiResponse.FailResponse("User not found.");
            }
            user.RefreshToken = string.Empty;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
            return ApiResponse.SuccessResponse(null, "Logout successful.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during logout for user: {Username}", username);
            return ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }
    }

    public async Task<ApiResponse<RefreshTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            var user = await _userManager.FindByNameAsync(request.Username);
            

            if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow )
            {
                return ApiResponse<RefreshTokenResponse>.FailResponse("Expired refresh token.");
            }

            if (!string.Equals(user.RefreshToken, request.RefreshToken))
            {
                return ApiResponse<RefreshTokenResponse>.FailResponse("Invalid refresh token.");
            }

            var newToken = _tokenService.CreateToken(user);
            var newRefreshToken = TokenHelper.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(_jwtOptions.RefeshTokenExpirationInMinutes);
            await _userManager.UpdateAsync(user);

            return ApiResponse<RefreshTokenResponse>.SuccessResponse(new RefreshTokenResponse
            {
                Token = newToken,
                RefreshToken = newRefreshToken
            }, "Refresh token successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during refresh token for request: {@Request}", request);
            return ApiResponse<RefreshTokenResponse>.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }
    }

    public async Task<ApiResponse<object>> RegisterAsync(RegisterRequest request, string role = Constants.USER_ROLE)
    {
        try
        {
            var user = new AppUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
            };

            var result = await _signInManager.UserManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var friendlyError = result.Errors.Select(e => e.Description).FirstOrDefault() ?? "Registration failed.";
                return ApiResponse.FailResponse(friendlyError);
            }

            var addRoleResult = await _userManager.AddToRoleAsync(user, role);
            if (!addRoleResult.Succeeded)
            {
                _logger.LogError("Failed to assign role to user {UserId}: {Errors}", user.Id, addRoleResult.Errors);
                return ApiResponse.FailResponse("An error occurred while setting up the account.");
            }

            return ApiResponse.SuccessResponse(null, "User registered successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during user registration for email: {Email}", request.Email);
            return ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }
    }

    public async Task<ApiResponse<object>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return ApiResponse.FailResponse("Invalid request.");
            }

            var decodedToken = HttpUtility.UrlDecode(request.Token);

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                _logger.LogError("Password reset failed for user {Email}: {Errors}", request.Email, errors);
                return ApiResponse.FailResponse($"Password reset failed: {errors}");
            }

            return ApiResponse.SuccessResponse(null, "Password has been reset successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset for email {Email}", request.Email);
            return ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }
    }
}
