using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

using System.Security.Claims;

namespace AIGenVideo.Server.Controllers.SocialPlatform
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class ConnectionsController : ControllerBase
    {
        private readonly ISocialPlatformService _socialPlatformService;

        public ConnectionsController(ISocialPlatformService socialPlatformService)
        {
            _socialPlatformService = socialPlatformService;
        }

        [HttpGet("connect-youtube")]
        [Authorize]
        public IActionResult ConnectYoutube()
        {
            var userId = HttpContext.User.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(ApiResponse.FailResponse("User ID is required."));
            }

            var props = new AuthenticationProperties
            {
                RedirectUri = "api/connections/youtube-callback"
            };

            props.Items["userId"] = userId;
            return Challenge(props, "GoogleYouTube");
        }

        [HttpGet("youtube-callback")]
        public async Task<IActionResult> YouTubeCallback()
        {
            try
            {
                var result = await HttpContext.AuthenticateAsync("GoogleYouTube");

                if (!result.Succeeded)
                {
                    return BadRequest(ApiResponse.FailResponse(""));
                }
                var userId = result?.Properties?.GetTokenValue("userId") ?? "";

                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(ApiResponse.FailResponse("User ID is required."));
                }

                var accessToken = result?.Properties?.GetTokenValue("access_token") ?? "";
                var refreshToken = result?.Properties?.GetTokenValue("refresh_token") ?? "";
                var expiresAtString = result?.Properties?.GetTokenValue("expires_at") ?? "";
                var scope = result?.Properties?.GetTokenValue("scope") ?? "";
                var externalUserId = result?.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
                var displayName = result?.Principal?.Identity?.Name ?? "";

                var expiresAtOffset = DateTimeOffset.Parse(expiresAtString!);
                var expiresAtUtc = expiresAtOffset.UtcDateTime;

                await _socialPlatformService.SaveTokenAsync(userId, "youtube", externalUserId, displayName, accessToken, refreshToken, expiresAtUtc, scope);

                return Ok(ApiResponse.SuccessResponse(null));
            } catch (Exception ex)
            {
                return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse($"An error occurred while processing the YouTube callback: {ex.Message}"));
            }
        }
    }
}
