using AIGenVideo.Server.Helpers;
using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.ResponseModels.Auth;
using Azure.Core;
using Google.Apis.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Text.Json;
using System.Web;

namespace AIGenVideo.Server.Services;

public class AuthService : IAuthService
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtOptions _jwtOptions;
    private readonly LoginGoogleOptions _loginGoogleOptions;
    private readonly ILogger<AuthService> _logger;
    private readonly IEmailSender _emailSender;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthService(SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, ITokenService tokenService, IOptions<JwtOptions> options, ILogger<AuthService> logger, IEmailSender emailSender, IHttpClientFactory httpClientFactory, IOptions<LoginGoogleOptions> googleOptions)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtOptions = options.Value;
        _loginGoogleOptions = googleOptions.Value;
        _logger = logger;
        _emailSender = emailSender;
        _httpClientFactory = httpClientFactory;
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
            var response = await GenerateLoginResponseAsync(user);

            return ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during user login for email: {Email}", request.Email);
            return ApiResponse<LoginResponse>.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }
    }

    public async Task<ApiResponse<LoginResponse>> LoginGoogleAsync(GoogleCodeRequest request)
    {
        try
        {
            var tokenData = await ExchangeCodeForTokensAsync(request.Code);
            if (tokenData is null)
            {
                return ApiResponse<LoginResponse>.FailResponse("Failed to exchange Google code for token.");
            }

            if (!tokenData.Value.TryGetProperty("id_token", out var idTokenElement))
            {
                return ApiResponse<LoginResponse>.FailResponse("Missing id_token in Google response.");
            }
            var idToken = idTokenElement.GetString();

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);

            if (payload == null)
            {
                return ApiResponse<LoginResponse>.FailResponse("Invalid Google ID token.");
            }

            var user = await CreateOrGetUserFromGooglePayloadAsync(payload);
            if (user is null)
            {
                return ApiResponse<LoginResponse>.FailResponse("Could not create or retrieve user.");
            }

            await SaveGoogleTokensToUserManagerAsync(user, tokenData.Value);

            var response = await GenerateLoginResponseAsync(user);

            return ApiResponse<LoginResponse>.SuccessResponse(response, "Google login successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during Google login with code: {Code}", request.Code);
            return ApiResponse<LoginResponse>.FailResponse(Constants.MESSAGE_SERVER_ERROR, Constants.SERVER_ERROR_CODE);
        }

    }

    private async Task<JsonElement?> ExchangeCodeForTokensAsync(string code)
    {
        string baseUrlGoogleAuth = "https://oauth2.googleapis.com/token";

        var client = _httpClientFactory.CreateClient();
        var tokenResponse = await client.PostAsync(baseUrlGoogleAuth, new FormUrlEncodedContent(new Dictionary<string, string>
        {
                { "code", code },
                { "client_id", _loginGoogleOptions.ClientId },
                { "client_secret", _loginGoogleOptions.ClientSecret },
                { "redirect_uri", _loginGoogleOptions.RedirectUri },
                { "grant_type", "authorization_code" }
            }));

        if (!tokenResponse.IsSuccessStatusCode)
        {
            return null;
        }

        var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
        return JsonDocument.Parse(tokenJson).RootElement;
    }

    private async Task<AppUser?> CreateOrGetUserFromGooglePayloadAsync(GoogleJsonWebSignature.Payload payload)
    {
        var loginProvider = "Google";
        var providerKey = payload.Subject;
        var email = payload.Email;
        var user = await _userManager.FindByLoginAsync(loginProvider, providerKey);

        if (user != null)
        {
            return user;
        }

        user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = await CreateNewUser(payload);
            if (user == null)
            {
                _logger.LogWarning("Failed to create new user from Google login: {Email}", email);
                return null;
            }
        }

        var loginInfo = new UserLoginInfo(loginProvider, providerKey, loginProvider);
        var loginResult = await _userManager.AddLoginAsync(user!, loginInfo);

        if (!loginResult.Succeeded)
        {
            _logger.LogWarning("Failed to link Google login to user {UserId}", user!.Id);
            return null;
        }

        _logger.LogInformation("New user created from Google login: {Email}", email);
        return user;
    }

    private async Task<AppUser?> CreateNewUser(GoogleJsonWebSignature.Payload payload)
    {
        var user = new AppUser
        {
            UserName = payload.Email,
            Email = payload.Email,
            FullName = payload.Name
        };

        var createResult = await _userManager.CreateAsync(user);

        if (!createResult.Succeeded)
        {
            var error = createResult.Errors.Select(e => e.Description).FirstOrDefault();
            _logger.LogWarning("Failed to create user: {Error}", error);
            return null;
        }

        var roleResult = await _userManager.AddToRoleAsync(user, Constants.USER_ROLE);
        if (!roleResult.Succeeded)
        {
            _logger.LogError("Failed to assign role to user {UserId}: {Errors}", user.Id, roleResult.Errors);
            return null;
        }

        return user;
    }

    private async Task SaveGoogleTokensToUserManagerAsync(AppUser user, JsonElement tokenData)
    {
        var now = DateTime.UtcNow;
        if (tokenData.TryGetProperty("access_token", out var at))
        {
            await _userManager.SetAuthenticationTokenAsync(user, "Google", "access_token", at.GetString());
        }

        if (tokenData.TryGetProperty("expires_in", out var exp))
        {
            var expiresAt = now.AddSeconds(exp.GetInt32()).ToString("o");
            await _userManager.SetAuthenticationTokenAsync(user, "Google", "expires_at", expiresAt);
        }

        if (tokenData.TryGetProperty("refresh_token", out var rt))
        {
            await _userManager.SetAuthenticationTokenAsync(user, "Google", "refresh_token", rt.GetString());
        }
    }

    private async Task<LoginResponse> GenerateLoginResponseAsync(AppUser user)
    {
        var refreshToken = TokenHelper.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(_jwtOptions.RefeshTokenExpirationInMinutes);
        await _userManager.UpdateAsync(user);

        var rolesList = await _userManager.GetRolesAsync(user);
        var role = rolesList.FirstOrDefault() ?? Constants.USER_ROLE;
        return new LoginResponse
        {
            Username = user.UserName ?? string.Empty,
            Token = _tokenService.CreateToken(user, role),
            RefreshToken = refreshToken,
            Role = role,
        };
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


            if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return ApiResponse<RefreshTokenResponse>.FailResponse("Expired refresh token.");
            }

            if (!string.Equals(user.RefreshToken, request.RefreshToken))
            {
                return ApiResponse<RefreshTokenResponse>.FailResponse("Invalid refresh token.");
            }
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? Constants.USER_ROLE;

            var newToken = _tokenService.CreateToken(user, role);
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
