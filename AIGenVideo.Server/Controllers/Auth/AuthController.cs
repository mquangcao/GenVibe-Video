namespace AIGenVideo.Server.Controllers.Auth;

//[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }


    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Invalid request"));
        }

        var result = await _authService.LoginAsync(request);
        if (result.Success)
        {
            return Ok(result);
        }

        return Unauthorized(result);
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Username or password is ..."));
        }
        var result = await _authService.RegisterAsync(request);
        if (result.Success)
        {
            return Ok(result);
        }

        if (result.StatusCode == Constants.SERVER_ERROR_CODE)
        {
            return StatusCode(Constants.SERVER_ERROR_CODE, result);
        }
        return BadRequest(result);
    }

    [HttpPost]
    [Route("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Invalid request"));
        }
        var result = await _authService.RefreshTokenAsync(request);
        if (result.Success)
        {
            return Ok(result);
        }

        if (result.StatusCode == Constants.SERVER_ERROR_CODE)
        {
            return StatusCode(Constants.SERVER_ERROR_CODE, result);
        }

        return Unauthorized(result);
    }

    [HttpPost]
    [Route("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.GetUsername();
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest(ApiResponse.FailResponse("Username is required"));
        }
        var result = await _authService.LogoutAsync(username);
        if (result.Success)
        {
            return Ok(result);
        }
        if (result.StatusCode == Constants.SERVER_ERROR_CODE)
        {
            return StatusCode(Constants.SERVER_ERROR_CODE, result);
        }
        return BadRequest(result);
    }

}
