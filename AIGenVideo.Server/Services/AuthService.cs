
using AIGenVideo.Server.Models.Configurations;
using Microsoft.Extensions.Options;

namespace AIGenVideo.Server.Services;

public class AuthService : IAuthService
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtOptions _jwtOptions;

    public AuthService(SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, ITokenService tokenService, IOptions<JwtOptions> options)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtOptions = options.Value;
    }

    public Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
    {
        throw new NotImplementedException("LoginAsync method is not implemented yet. Please implement the logic for user authentication and token generation here.");
    }
}
