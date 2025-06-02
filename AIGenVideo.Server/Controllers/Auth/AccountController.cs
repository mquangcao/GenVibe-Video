using AIGenVideo.Server.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace AIGenVideo.Server.Controllers.Auth;

[Authorize]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;
    public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }
    
    [HttpGet("profile")]
    public async Task<IActionResult> GetUserInfo()
    {
        var username = HttpContext.User.GetUsername();
        if (string.IsNullOrEmpty(username))
        {
            return BadRequest(ApiResponse.FailResponse("Username not found in token claims"));
        }

        var user = await _userManager.FindByNameAsync(username);
        if (user == null)
        {
            return NotFound(ApiResponse.FailResponse("User not found"));
        }
        var role = await _userManager.GetRolesAsync(user);

        return Ok(ApiResponse<UserProfileResponse>.SuccessResponse(
            new UserProfileResponse()
            {
                Avatar = string.Empty,
                Username = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Name = user.FullName ?? string.Empty,
                Role = role.FirstOrDefault() ?? Constants.USER_ROLE
            }));
    }
}
