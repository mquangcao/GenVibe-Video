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
    // Add methods for account management here (e.g., register, login, logout, etc.)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserInfo(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse.FailResponse("User not found"));
        }
        return Ok(ApiResponse<AppUser>.SuccessResponse(user));
    }
}
