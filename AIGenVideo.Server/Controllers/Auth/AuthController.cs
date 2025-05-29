using AIGenVideo.Server.Helpers;
using AIGenVideo.Server.Models.Configurations;
using Microsoft.Extensions.Options;

namespace AIGenVideo.Server.Controllers.Auth;

//[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<AppUser> _signInManager;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly JwtOptions _jwtOptions;

    public AuthController(SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, ITokenService tokenService, IOptions<JwtOptions> options)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _jwtOptions = options.Value;
    }


    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return Ok(ApiResponse.FailResponse("Username or password is ..."));
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.UserName == request.Email);
        if (user == null)
        {
            return Unauthorized(ApiResponse.FailResponse("Invalid username!"));
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

        if (!result.Succeeded)
        {
            return Unauthorized(ApiResponse.FailResponse("Username not found and/or password incorrect"));
        }

        var refreshToken = TokenHelper.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(_jwtOptions.RefeshTokenExpirationInMinutes);
        await _userManager.UpdateAsync(user);

        return Ok(ApiResponse.SuccessResponse(new
        {
            id = user.Id,
            username = user.UserName,
            email = user.Email,
            token = _tokenService.CreateToken(user),
            refreshToken
        }, "Login successful."));
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Username or password is ..."));
        }
        var user = new AppUser()
        {
            UserName = request.Email,
            Email = request.Email
        };

        var result = await _signInManager.UserManager.CreateAsync(user, request.Password);
        if (result.Succeeded)
        {
            return Created("", ApiResponse.SuccessResponse(null, "User registered successfully."));
        }
        return BadRequest(ApiResponse.FailResponse("Error register user"));
    }


}
