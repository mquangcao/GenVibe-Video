using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.DomainModels;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.YouTube.v3.Data;
using Google.Apis.YouTube.v3;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Google.Apis.Upload;

namespace AIGenVideo.Server.Services.SocialPlatform;

[Authorize]
public class YouTubePlatformService : IPlatformService
{
    private readonly HttpClient _httpClient;
    private readonly ISocialPlatformService _socialPlatformService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<YouTubePlatformService> _logger;
    private readonly ApplicationDbContext _applicationDbContext;
    private readonly LoginGoogleOptions _googleOptions;
    private readonly IOAuthStateService _oAuthStateService;
    private readonly IHttpClientFactory _httpClientFactory;




    public YouTubePlatformService(IHttpClientFactory httpClientFactory, ISocialPlatformService socialPlatformService, IHttpContextAccessor httpContextAccessor, ILogger<YouTubePlatformService> logger, ApplicationDbContext applicationDbContext, IOptions<LoginGoogleOptions> loginGoogleOptions, IOAuthStateService oAuthStateService)
    {
        _httpClientFactory = httpClientFactory;
        _httpClient = httpClientFactory.CreateClient();
        _socialPlatformService = socialPlatformService;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
        _applicationDbContext = applicationDbContext;
        _googleOptions = loginGoogleOptions.Value;
        _oAuthStateService = oAuthStateService;
    }

    private async Task<JsonElement> GetChannelDataAsync()
    {
        var userId = _httpContextAccessor.HttpContext?.User?.GetUserId() ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var accessToken = await GetAccessToken();

        if (string.IsNullOrEmpty(accessToken))
        {
            return default;
        }

        var request = new HttpRequestMessage(
            HttpMethod.Get,
            "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true"
        );
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var items = doc.RootElement.GetProperty("items");

        if (items.GetArrayLength() == 0)
        {
            throw new Exception("No YouTube channel found for this token.");
        }

        return items[0];
    }

    public async Task<string?> GetChannelNameAsync()
    {
        var channel = await GetChannelDataAsync();
        return channel.GetProperty("snippet").GetProperty("title").GetString();
    }

    public async Task<int> GetSubscriberCountAsync()
    {
        var channel = await GetChannelDataAsync();

        if (int.TryParse(channel.GetProperty("statistics").GetProperty("subscriberCount").GetString(), out var subCount))
        {
            return subCount;
        }
        return default;
    }

    public async Task<int> GetVideoCountAsync()
    {
        var channel = await GetChannelDataAsync();

        if (int.TryParse(channel.GetProperty("statistics").GetProperty("videoCount").GetString(), out var videoCount))
        {
            return videoCount;
        }
        return default;
    }

    public async Task<long> GetViewCountAsync()
    {
        var channel = await GetChannelDataAsync();
        if (int.TryParse(channel.GetProperty("statistics").GetProperty("viewCount").GetString(), out var viewCount))
        {
            return viewCount;
        }
        return default;
    }

    public async Task<string?> GetChannelHandleAsync()
    {
        var channel = await GetChannelDataAsync();
        if (channel.GetProperty("snippet").TryGetProperty("customUrl", out var handle))
        {
            return handle.GetString();
        }
        return null;
    }

    public async Task<string?> GetAvatarUrlAsync()
    {
        var channel = await GetChannelDataAsync();
        var thumbnails = channel.GetProperty("snippet").GetProperty("thumbnails");

        return GetAvatarUrl(thumbnails);
    }

    private string? GetAvatarUrl(JsonElement thumbnails)
    {
        if (thumbnails.TryGetProperty("high", out var highRes))
        {
            return highRes.GetProperty("url").GetString();
        }
        else if (thumbnails.TryGetProperty("medium", out var mediumRes))
        {
            return mediumRes.GetProperty("url").GetString();
        }
        else if (thumbnails.TryGetProperty("default", out var defaultRes))
        {
            return defaultRes.GetProperty("url").GetString();
        }

        return null;
    }

    public async Task<PlatformInfo> GetPlatFormInfo()
    {
        try
        {
            var userId = _httpContextAccessor.HttpContext?.User?.GetUserId() ?? throw new UnauthorizedAccessException("User is not authenticated.");
            var accountInfo = await _socialPlatformService.GetAccountAsync(userId, Constants.YOUTUBE_PLATFORM_CODE);
            var channel = await GetChannelDataAsync();
            var channelName = channel.GetProperty("snippet").GetProperty("title").GetString();
            if (!int.TryParse(channel.GetProperty("statistics").GetProperty("subscriberCount").GetString(), out var subCount))
            {
                subCount = 0;
            }
            if (!int.TryParse(channel.GetProperty("statistics").GetProperty("videoCount").GetString(), out var videoCount))
            {
                videoCount = 0;
            }
            if (!int.TryParse(channel.GetProperty("statistics").GetProperty("viewCount").GetString(), out var viewCount))
            {
                viewCount = 0;
            }
            var handle = channel.GetProperty("snippet").GetProperty("customUrl").GetString();
            var thumbnails = channel.GetProperty("snippet").GetProperty("thumbnails");
            var avatarUrl = GetAvatarUrl(thumbnails);

            return new PlatformInfo()
            {
                PlatformCode = Constants.YOUTUBE_PLATFORM_CODE,
                IsConnecting = true,
                ChannelName = channelName ?? string.Empty,
                SubscriberCount = subCount,
                VideoCount = videoCount,
                ViewCount = viewCount,
                AvatarUrl = avatarUrl ?? string.Empty,
                ChannelHandle = handle ?? string.Empty,
                ConnectedDate = accountInfo?.ConnectedAt ?? DateTime.UtcNow,
                LastSync = accountInfo?.LastRefreshedAt ?? DateTime.UtcNow,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Error : {e}", ex.Message);
            return new PlatformInfo()
            {
                PlatformCode = Constants.YOUTUBE_PLATFORM_CODE,
                IsConnecting = false,
                ErrorMsg = ex.Message,
            };
        }
    }

    public async Task<string?> GetAccessToken()
    {
        var userId = _httpContextAccessor.HttpContext?.User?.GetUserId() ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var accessToken = await _socialPlatformService.GetAcessTokenAsync(userId, Constants.YOUTUBE_PLATFORM_CODE);

        if (!string.IsNullOrEmpty(accessToken))
        {
            return accessToken;
        }

        var refreshToken = await _socialPlatformService.GetRefreshTokenAsync(userId, Constants.YOUTUBE_PLATFORM_CODE);
        if (string.IsNullOrEmpty(refreshToken))
        {
            return string.Empty;
        }

        var requestBody = new Dictionary<string, string>
        {
            { "client_id", _googleOptions.ClientId },
            { "client_secret", _googleOptions.ClientSecret },
            { "refresh_token", refreshToken },
            { "grant_type", "refresh_token" }
        };

        var requestContent = new FormUrlEncodedContent(requestBody);
        var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", requestContent);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to refresh access token: {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(json);

        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
        {
            throw new Exception("Invalid token response from Google.");
        }

        await _socialPlatformService.UpdateAccessTokenAsync(userId, Constants.YOUTUBE_PLATFORM_CODE, tokenResponse.AccessToken, tokenResponse.ExpiryTime);

        return tokenResponse.AccessToken;
    }

    public async Task<string?> GetOAuthUrl(string redirectUrl)
    {
        try
        {
            var state = Guid.NewGuid().ToString();
            var userId = _httpContextAccessor?.HttpContext?.User.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            await _oAuthStateService.SetStateAsync(state, new OAuthStateData { UserId = userId });

            var oauthUrl = QueryHelpers.AddQueryString("https://accounts.google.com/o/oauth2/v2/auth", new Dictionary<string, string?>
            {
                ["client_id"] = _googleOptions.ClientId,
                ["redirect_uri"] = redirectUrl,
                ["response_type"] = "code",
                ["scope"] = "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload ",
                ["access_type"] = "offline",
                ["prompt"] = "consent",
                ["state"] = state
            });

            return oauthUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error generating OAuth URL: {Message}", ex.Message);
            return null;
        }
    }

    public async Task<PlatformRedirectResult> HandlePlatformRedirectAsync(string code, string state, string redirectUrl)
    {
        try
        {
            var stateData = await _oAuthStateService.GetStateAsync(state);

            if (stateData == null || string.IsNullOrEmpty(stateData.UserId))
            {
                return new PlatformRedirectResult()
                {
                    Message = "Invalid state or user not authenticated.",
                    IsSuccess = false,
                    StatusCode = 400
                };
            }

            var userId = stateData.UserId;

            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = _googleOptions.ClientId,
                ["client_secret"] = _googleOptions.ClientSecret,
                ["redirect_uri"] = redirectUrl,
                ["grant_type"] = "authorization_code"
            }));

            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new PlatformRedirectResult()
                {
                    Message = $"Google token error: {content}",
                    IsSuccess = false,
                    StatusCode = 400
                };
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

            await _socialPlatformService.SaveTokenAsync(userId, Constants.YOUTUBE_PLATFORM_CODE, googleId!, name!, accessToken!, refreshToken!, expiry, "youtube.readonly");

            return new PlatformRedirectResult()
            {
                Message = "YouTube account connected successfully.",
                IsSuccess = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Error handling YouTube redirect: {Message}", ex.Message);
            return new PlatformRedirectResult()
            {
                Message = $"Error connecting YouTube account: {ex.Message}",
                IsSuccess = false,
                StatusCode = (int)HttpStatusCode.InternalServerError
            };
        }
    }

    public async Task<string?> UploadVideoAsync(string videoFilePath, string title, string description, List<string> tags, string privacyStatus = "private")
    {
        var userId = _httpContextAccessor.HttpContext?.User?.GetUserId() ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var accessToken = await GetAccessToken();

        if (string.IsNullOrEmpty(accessToken))
        {
            _logger.LogError("Access token is missing, cannot upload video.");
            return null;
        }

        try
        {
            var credential = GoogleCredential.FromAccessToken(accessToken);

            var youtubeService = new YouTubeService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = "AIGenVideo"
            });

            var video = new Video();
            video.Snippet = new VideoSnippet();
            video.Snippet.Title = title;
            video.Snippet.Description = description;
            video.Snippet.Tags = tags;
            video.Snippet.CategoryId = "28";  // https://developers.google.com/youtube/v3/docs/videoCategories/list

            video.Status = new VideoStatus();
            video.Status.PrivacyStatus = privacyStatus; // "public", "private" or "unlisted"

            // 4. Mở luồng đọc file video
            using (var fileStream = new FileStream(videoFilePath, FileMode.Open, FileAccess.Read))
            {
                var videosInsertRequest = youtubeService.Videos.Insert(video, "snippet,status", fileStream, "video/*");

                videosInsertRequest.ProgressChanged += progress =>
                {
                    switch (progress.Status)
                    {
                        case UploadStatus.Uploading:
                            _logger.LogInformation("{BytesSent} bytes sent.", progress.BytesSent);
                            break;
                        case UploadStatus.Completed:
                            _logger.LogInformation("Upload completed.");
                            break;
                        case UploadStatus.Failed:
                            _logger.LogError("Upload failed: {Exception}", progress.Exception);
                            break;
                    }
                };

                // Đăng ký sự kiện khi tải lên hoàn tất hoặc thất bại
                videosInsertRequest.ResponseReceived += uploadedVideo =>
                {
                    if (uploadedVideo != null)
                    {
                        _logger.LogInformation("Video id '{0}' was successfully uploaded.", uploadedVideo.Id);
                    }
                };

                // Thực hiện tải lên
                await videosInsertRequest.UploadAsync();

                // Trả về ID của video đã tải lên
                return videosInsertRequest.ResponseBody?.Id;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Error uploading video: {Message}", ex.Message);
            return null;
        }
    }

    public class GoogleTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresInSeconds { get; set; }

        [JsonPropertyName("scope")]
        public string Scope { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        public DateTime ExpiryTime => DateTime.UtcNow.AddSeconds(ExpiresInSeconds);
    }
}
