using AIGenVideo.Server.Data.Entities;
using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Services.SocialPlatform;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

namespace AIGenVideo.Server.Controllers.SocialPlatform
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class ConnectionsController : ControllerBase
    {
        private readonly ISocialPlatformService _socialPlatformService;
        private readonly IOAuthStateService _oAuthStateService;
        private readonly LoginGoogleOptions _googleOptions;
        private readonly LinkGenerator _linkGenerator;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly TikTokOptions _tiktokOptions;
        private readonly ILogger<ConnectionsController> _logger;
        private readonly SocialPlatformFactory _socialPlatformFactory;
        private readonly FacebookOptions _facebookOptions;

        public ConnectionsController(ISocialPlatformService socialPlatformService, IOAuthStateService oAuthStateService, IOptions<LoginGoogleOptions> googleOptions, LinkGenerator linkGenerator, IHttpClientFactory httpClientFactory, IOptions<TikTokOptions> tiktokOptions, ILogger<ConnectionsController> logger, SocialPlatformFactory socialPlatformFactory, IOptions<FacebookOptions> facebookOptions)
        {
            _socialPlatformService = socialPlatformService;
            _oAuthStateService = oAuthStateService;
            _googleOptions = googleOptions.Value;
            _linkGenerator = linkGenerator;
            _httpClientFactory = httpClientFactory;
            _tiktokOptions = tiktokOptions.Value;
            _logger = logger;
            _socialPlatformFactory = socialPlatformFactory;
            _facebookOptions = facebookOptions.Value;
        }
        #region addOauth2
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
        public async Task<IActionResult> YouTubeCallbackOAuth()
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
        #endregion

        [HttpGet("/api/oauth/platform-connect")]
        [Authorize]
        public async Task<IActionResult> GetOAuthUrl([FromQuery] string redirectUri, [FromQuery] string platform)
        {
            try
            {
                var redirectUrl = GetRedirectUrl(platform);
                var socialPlatform = _socialPlatformFactory.Create(platform);
                var url = await socialPlatform.GetOAuthUrl(redirectUrl);

                return Ok(ApiResponse.SuccessResponse(new
                {
                    Url = url
                }));
            } 
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse.FailResponse($"Invalid platform: {ex.Message}"));
            }
            catch (Exception ex)
            {
                return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse($"An error occurred while generating the OAuth URL: {ex.Message}"));
            }
        }

        private string GetRedirectUrl(string platform)
        {
            return platform switch
            {
                Constants.YOUTUBE_PLATFORM_CODE => _linkGenerator.GetUriByAction(HttpContext, "YoutubeCallback")!,
                Constants.FACEBOOK_PLATFORM_CODE => _linkGenerator.GetUriByAction(HttpContext, "FacebookCallback")!,
                Constants.TIKTOK_PLATFORM_CODE => _linkGenerator.GetUriByAction(HttpContext, "TikTokCallback")!,
                _ => throw new ArgumentException($"Unknown platform: {platform}", nameof(platform))
            };
        }

        #region youtube
        [HttpGet("/oauth/youtube-callback")]
        public async Task<IActionResult> YoutubeCallback(string code, string state)
        {
            var socialPlatform = _socialPlatformFactory.Create(Constants.YOUTUBE_PLATFORM_CODE);
            var handleResult = await socialPlatform.HandlePlatformRedirectAsync(code, state, GetRedirectUrl(Constants.YOUTUBE_PLATFORM_CODE));

            if (!handleResult.IsSuccess)
            {
                return StatusCode(handleResult.StatusCode, ApiResponse.FailResponse(handleResult.Message));
            }

            var html = """
                <html>
                <body>
                <script>
                    window.opener.postMessage({ success: true , platform : "youtube" }, "*");
                    window.close();
                </script>
                </body>
                </html>
            """;

            return Content(html, "text/html");
        }
        #endregion
        #region tiktok
        [HttpGet("/oauth/tiktok-callback")]
        public async Task<IActionResult> TikTokCallback(string code, string state)
        {
            var stateData = await _oAuthStateService.GetStateAsync(state);
            if (stateData == null || string.IsNullOrEmpty(stateData.UserId))
                return BadRequest("Invalid state");

            var userId = stateData.UserId;

            var httpClient = _httpClientFactory.CreateClient();
            var tokenResponse = await httpClient.PostAsync("https://open.tiktokapis.com/v2/oauth/token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_key"] = _tiktokOptions.ClientId,
                ["client_secret"] = _tiktokOptions.ClientSecret,
                ["code"] = code,
                ["grant_type"] = "authorization_code",
                ["redirect_uri"] = GetRedirectUrl(Constants.TIKTOK_PLATFORM_CODE),
                ["code_verifier"] = stateData.CodeVerifier!,
            }));

            var content = await tokenResponse.Content.ReadAsStringAsync();
            Console.WriteLine("TikTok token error:");
            Console.WriteLine(content);
            if (!tokenResponse.IsSuccessStatusCode)
                return BadRequest($"Token error: {content}");

            var payload = JsonDocument.Parse(content).RootElement;
            var accessToken = payload.GetProperty("access_token").GetString();
            var refreshToken = payload.GetProperty("refresh_token").GetString();
            var expiresIn = payload.GetProperty("expires_in").GetInt32();
            var expiry = DateTime.UtcNow.AddSeconds(expiresIn);

            // Gọi API lấy user info
            var apiClient = _httpClientFactory.CreateClient();
            apiClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var userInfoResp = await apiClient.GetAsync("https://open.tiktokapis.com/v2/user/info/");
            var userInfoJson = await userInfoResp.Content.ReadFromJsonAsync<JsonElement>();

            var userData = userInfoJson.GetProperty("data").GetProperty("user");
            var tiktokId = userData.GetProperty("open_id").GetString();
            var displayName = userData.GetProperty("display_name").GetString();

            await _socialPlatformService.SaveTokenAsync(userId, "tiktok", tiktokId!, displayName!, accessToken!, refreshToken!, expiry, "user.info.basic,video.list");

            var html = """
                <html><body><script>
                    window.opener.postMessage({ success: true , platform : "tiktok" }, "*");
                    window.close();
                </script></body></html>
            """;
            return Content(html, "text/html");
        }

        #endregion

        #region facebook
        [HttpGet("/oauth/facebook-callback")]
        public async Task<IActionResult> FacebookCallback(string code, string state)
        {
            try
            {
                var stateData = await _oAuthStateService.GetStateAsync(state);
                if (stateData == null || string.IsNullOrEmpty(stateData.UserId))
                {
                    return BadRequest("Invalid state");
                }

                var userId = stateData.UserId;

                var httpClient = _httpClientFactory.CreateClient();
                var response = await httpClient.PostAsync("https://graph.facebook.com/v19.0/oauth/access_token", new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["client_id"] = _facebookOptions.ClientId,
                    ["redirect_uri"] = GetRedirectUrl(Constants.FACEBOOK_PLATFORM_CODE),
                    ["client_secret"] = _facebookOptions.ClientSecret,
                    ["code"] = code
                }));

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest($"Facebook token error: {await response.Content.ReadAsStringAsync()}");
                }

                var payload = await response.Content.ReadFromJsonAsync<JsonElement>();

                // Lấy access_token
                var accessToken = payload.GetProperty("access_token").GetString();

                // Thử lấy expires_in nếu có
                int? expiresIn = null;
                if (payload.TryGetProperty("expires_in", out var expiresInElement))
                {
                    expiresIn = expiresInElement.GetInt32();
                }

                // Gán thời điểm hết hạn
                var expiry = expiresIn.HasValue
                    ? DateTime.UtcNow.AddSeconds(expiresIn.Value)
                    : DateTime.UtcNow.AddDays(60); 

                // Lấy thông tin người dùng
                var userInfoResponse = await httpClient.GetAsync($"https://graph.facebook.com/me?fields=id,name,picture&access_token={accessToken}");
                if (!userInfoResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Facebook user info error: {await userInfoResponse.Content.ReadAsStringAsync()}");
                }

                var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<JsonElement>();
                var facebookId = userInfo.GetProperty("id").GetString();
                var displayName = userInfo.GetProperty("name").GetString();

                await _socialPlatformService.SaveTokenAsync(
                    userId,
                    Constants.FACEBOOK_PLATFORM_CODE,
                    facebookId!,
                    displayName!,
                    accessToken!,
                    string.Empty,
                    expiry,
                    "public_profile,email"
                );

                var html = """
                    <html>
                    <body>
                    <script>
                        window.opener.postMessage({ success: true , platform : "facebook" }, "*");
                        window.close();
                    </script>
                    </body>
                    </html>
                """;

                return Content(html, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FacebookCallback failed");
                return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse($"An error occurred while processing the Facebook callback: {ex.Message}"));
            }
        }

        #endregion


    }
}
