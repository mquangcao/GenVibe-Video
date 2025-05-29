using Microsoft.AspNetCore.Authorization;

namespace AIGenVideo.Server.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    public UsersController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        return Ok(ApiResponse<List<AppUser>>.SuccessResponse(users));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse.FailResponse("Can't find user"));
        }
        return Ok(ApiResponse<AppUser>.SuccessResponse(user));
    }
}
