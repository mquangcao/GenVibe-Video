using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.DomainModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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

        public ConnectionsController(ISocialPlatformService socialPlatformService, IOAuthStateService oAuthStateService, IOptions<LoginGoogleOptions> googleOptions, LinkGenerator linkGenerator, IHttpClientFactory httpClientFactory, IOptions<TikTokOptions> tiktokOptions)
        {
            _socialPlatformService = socialPlatformService;
            _oAuthStateService = oAuthStateService;
            _googleOptions = googleOptions.Value;
            _linkGenerator = linkGenerator;
            _httpClientFactory = httpClientFactory;
            _tiktokOptions = tiktokOptions.Value;
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



        #region youtube
        [HttpGet("/api/oauth/google-url")]
        [Authorize]
        public async Task<IActionResult> GetGoogleOAuthUrl([FromQuery] string redirectUri)
        {
            var state = Guid.NewGuid().ToString(); // hoặc: $"{userId}:{random}"
            var userId = HttpContext.User.GetUserId(); // tự viết extension hoặc lấy từ JWT

            await _oAuthStateService.SetStateAsync(state, new OAuthStateData { UserId = userId });

            var oauthUrl = QueryHelpers.AddQueryString("https://accounts.google.com/o/oauth2/v2/auth", new Dictionary<string, string?>
            {
                ["client_id"] = _googleOptions.ClientId,
                ["redirect_uri"] = _linkGenerator.GetUriByAction(HttpContext, "GoogleCallback"), 
                ["response_type"] = "code",
                ["scope"] = "openid email profile https://www.googleapis.com/auth/youtube.readonly",
                ["access_type"] = "offline",
                ["prompt"] = "consent",
                ["state"] = state
            });

            return Ok(ApiResponse.SuccessResponse(new
            {
                Url = oauthUrl
            }));
        }

        [HttpGet("/oauth/google-callback")]
        public async Task<IActionResult> GoogleCallback(string code, string state)
        {
            var stateData = await _oAuthStateService.GetStateAsync(state);
            if (stateData == null || string.IsNullOrEmpty(stateData.UserId))
            {
                return BadRequest("Invalid state");
            }

            var userId = stateData.UserId;

            // Gọi token endpoint
            var httpClient = _httpClientFactory.CreateClient();
            var link = _linkGenerator.GetUriByAction(HttpContext, "GoogleCallback");
            var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = _googleOptions.ClientId,
                ["client_secret"] = _googleOptions.ClientSecret,
                ["redirect_uri"] = _linkGenerator.GetUriByAction(HttpContext, "GoogleCallback")!,
                ["grant_type"] = "authorization_code"
            }));
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                // In ra lỗi chi tiết (có thể log hoặc throw exception tuỳ bạn)
                Console.WriteLine("Token exchange failed:");
                Console.WriteLine(content);

                return BadRequest($"Google token error: {content}");
            }

            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            var accessToken = payload.GetProperty("access_token").GetString();
            var refreshToken = payload.GetProperty("refresh_token").GetString();
            var expiresIn = payload.GetProperty("expires_in").GetInt32();
            var expiry = DateTime.UtcNow.AddSeconds(expiresIn);

            // Gọi UserInfo để lấy GoogleId + DisplayName
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var userInfo = await client.GetFromJsonAsync<JsonElement>("https://www.googleapis.com/oauth2/v2/userinfo");

            var googleId = userInfo.GetProperty("id").GetString();
            var name = userInfo.GetProperty("name").GetString();

            await _socialPlatformService.SaveTokenAsync(userId, "youtube", googleId!, name!, accessToken!, refreshToken!, expiry, "youtube.readonly");

            // Trả về HTML dùng postMessage
            var html = """
                <html>
                <body>
                <script>
                    window.opener.postMessage({ success: true }, "*");
                    window.close();
                </script>
                </body>
                </html>
            """;

            return Content(html, "text/html");
        }
        #endregion
        #region tiktok
        [HttpGet("/api/oauth/tiktok-url")]
        [Authorize]
        public async Task<IActionResult> GetTikTokOAuthUrl()
        {
            var state = Guid.NewGuid().ToString();
            var userId = HttpContext.User.GetUserId();

            // Tạo code_verifier
            var codeVerifier = GenerateCodeVerifier();
            var codeChallenge = GenerateCodeChallenge(codeVerifier);

            // Lưu cả userId và code_verifier vào Redis
            await _oAuthStateService.SetStateAsync(state, new OAuthStateData
            {
                UserId = userId,
                CodeVerifier = codeVerifier
            });

            var url = QueryHelpers.AddQueryString("https://www.tiktok.com/v2/auth/authorize", new Dictionary<string, string?>
            {
                ["client_key"] = _tiktokOptions.ClientId,
                ["redirect_uri"] = "https://5db0-14-169-70-31.ngrok-free.app/oauth/tiktok-callback",
                ["response_type"] = "code",
                ["scope"] = "user.info.basic,video.list",
                ["state"] = state,
                ["code_challenge"] = codeChallenge,
                ["code_challenge_method"] = "S256"
            });

            return Ok(ApiResponse.SuccessResponse(new { Url = url }));
        }

        private string GenerateCodeVerifier()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }

        private string GenerateCodeChallenge(string codeVerifier)
        {
            var bytes = Encoding.ASCII.GetBytes(codeVerifier);
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash)
                .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }



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
                ["redirect_uri"] = "https://5db0-14-169-70-31.ngrok-free.app/oauth/tiktok-callback",
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
                    window.opener.postMessage({ success: true }, "*");
                    window.close();
                </script></body></html>
            """;
            return Content(html, "text/html");
        }

        #endregion
    }
}
