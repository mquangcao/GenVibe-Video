using Google.Apis.Auth;
using System.Net.Http;
using System.Text.Json;

namespace AIGenVideo.Server.Controllers.Auth;

//[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IHttpClientFactory _httpClientFactory;
    public AuthController(IAuthService authService, IHttpClientFactory httpClientFactory)
    {
        _authService = authService;
        _httpClientFactory = httpClientFactory;
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
            return BadRequest(ApiResponse.FailResponse("Invalid email or password"));
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

    [HttpPost]
    [Route("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Invalid email"));
        }
        var result = await _authService.ForgotPasswordAsync(request);
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
    [Route("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Invalid request"));
        }
        var result = await _authService.ResetPasswordAsync(request);
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

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleCodeRequest request)
    {
        if( !ModelState.IsValid)
        {
            return BadRequest(ApiResponse.FailResponse("Invalid request"));
        }

        var result = await _authService.LoginGoogleAsync(request);
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


}
