using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.DomainModels;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Http;
using System.Text.Json;

namespace AIGenVideo.Server.Services.SocialPlatform;

public class FacebookPlatformService : IPlatformService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOAuthStateService _oAuthStateService;
    private readonly ILogger<FacebookPlatformService> _logger;
    private readonly FacebookOptions _facebookOptions;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ISocialPlatformService _socialPlatformService;
    private readonly HttpClient _httpClient;

    public FacebookPlatformService(IOAuthStateService oAuthStateService, IHttpContextAccessor httpContextAccessor, ILogger<FacebookPlatformService> logger, IOptions<FacebookOptions> facebookOptions, IHttpClientFactory httpClientFactory, ISocialPlatformService socialPlatformService)
    {
        _httpClient = httpClientFactory.CreateClient();
        _oAuthStateService = oAuthStateService;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
        _facebookOptions = facebookOptions.Value;
        _httpClientFactory = httpClientFactory;
        _socialPlatformService = socialPlatformService;
    }

    private async Task<JsonElement> GetPageDataAsync()
    {
        var userId = _httpContextAccessor.HttpContext?.User?.GetUserId()
                     ?? throw new UnauthorizedAccessException();

        var userAccessToken = await _socialPlatformService.GetAcessTokenAsync(userId, Constants.FACEBOOK_PLATFORM_CODE);
        if (string.IsNullOrEmpty(userAccessToken))
        {
            throw new Exception("Facebook access token not found.");
        }

        var response = await _httpClient.GetAsync($"https://graph.facebook.com/v19.0/me/accounts?access_token={userAccessToken}");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var data = doc.RootElement.GetProperty("data");

        if (data.GetArrayLength() == 0)
        {
            throw new Exception("No page found for this Facebook account.");
        }

        return data[0];
    }

    public Task<string?> GetAccessToken()
    {
        return Task.FromResult<string?>(null);
    }

    public async Task<string?> GetAvatarUrlAsync()
    {
        var page = await GetPageDataAsync();
        var pageId = page.GetProperty("id").GetString();
        var pageAccessToken = page.GetProperty("access_token").GetString();

        var response = await _httpClient.GetAsync(
            $"https://graph.facebook.com/v19.0/{pageId}/picture?redirect=false&type=large&access_token={pageAccessToken}");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("data").GetProperty("url").GetString();

    }

    public async Task<string?> GetChannelHandleAsync()
    {
        var page = await GetPageDataAsync();
        return page.GetProperty("id").GetString();
    }

    public async Task<string?> GetChannelNameAsync()
    {
        var page = await GetPageDataAsync();
        return page.GetProperty("name").GetString();
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

            var oauthUrl = QueryHelpers.AddQueryString("https://www.facebook.com/v19.0/dialog/oauth", new Dictionary<string, string?>
            {
                ["client_id"] = _facebookOptions.ClientId, // Tên property có thể là AppId hoặc ClientId tùy bạn đặt
                ["redirect_uri"] = redirectUrl,
                ["response_type"] = "code",
                ["scope"] = "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,pages_manage_metadata,pages_manage_engagement,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_ads", // scope bạn cần
                ["state"] = state
            });

            return oauthUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error generating Facebook OAuth URL: {Message}", ex.Message);
            return null;
        }
    }


    public async Task<PlatformInfo> GetPlatFormInfo()
    {
        try
        {
            var userId = _httpContextAccessor.HttpContext?.User?.GetUserId()
                     ?? throw new UnauthorizedAccessException("User is not authenticated.");

            var accountInfo = await _socialPlatformService.GetAccountAsync(userId, Constants.FACEBOOK_PLATFORM_CODE);
            var page = await GetPageDataAsync();

            var pageId = page.GetProperty("id").GetString();
            var pageName = page.GetProperty("name").GetString();

            var avatarUrl = await GetAvatarUrlAsync();

            int followerCount = 0;
            try
            {
                followerCount = await GetSubscriberCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Không lấy được follower_count Facebook: {Message}", ex.Message);
            }

            int postCount = 0;
            try
            {
                postCount = await GetVideoCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Không lấy được post count Facebook: {Message}", ex.Message);
            }

            return new PlatformInfo
            {
                PlatformCode = Constants.FACEBOOK_PLATFORM_CODE,
                IsConnecting = true,
                ChannelName = pageName ?? string.Empty,
                SubscriberCount = followerCount,
                VideoCount = postCount,
                ViewCount = -1, 
                AvatarUrl = avatarUrl ?? string.Empty,
                ChannelHandle = pageId ?? string.Empty,
                ConnectedDate = accountInfo?.ConnectedAt ?? DateTime.UtcNow,
                LastSync = accountInfo?.LastRefreshedAt ?? DateTime.UtcNow,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError("Error getting Facebook platform info: {Message}", ex.Message);
            return new PlatformInfo
            {
                PlatformCode = Constants.FACEBOOK_PLATFORM_CODE,
                IsConnecting = false,
                ErrorMsg = ex.Message
            };
        }

    }

    public async Task<int> GetSubscriberCountAsync()
    {
        var page = await GetPageDataAsync();
        var pageId = page.GetProperty("id").GetString();
        var pageAccessToken = page.GetProperty("access_token").GetString();

        var response = await _httpClient.GetAsync(
            $"https://graph.facebook.com/v19.0/{pageId}?fields=followers_count&access_token={pageAccessToken}");

        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("followers_count").GetInt32();
    }

    public async Task<int> GetVideoCountAsync()
    {
        var page = await GetPageDataAsync();
        var pageId = page.GetProperty("id").GetString();
        var pageAccessToken = page.GetProperty("access_token").GetString();

        var response = await _httpClient.GetAsync(
            $"https://graph.facebook.com/v19.0/{pageId}/videos?limit=100&access_token={pageAccessToken}");

        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var posts = doc.RootElement.GetProperty("data");

        return posts.GetArrayLength();
    }

    public Task<long> GetViewCountAsync()
    {
        return Task.FromResult(-1L);
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
            var response = await httpClient.PostAsync("https://graph.facebook.com/v19.0/oauth/access_token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = _facebookOptions.ClientId,
                ["redirect_uri"] = redirectUrl,
                ["client_secret"] = _facebookOptions.ClientSecret,
                ["code"] = code
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

            // Lấy access_token
            var accessToken = payload.GetProperty("access_token").GetString();

            int? expiresIn = null;
            if (payload.TryGetProperty("expires_in", out var expiresInElement))
            {
                expiresIn = expiresInElement.GetInt32();
            }

            var expiry = expiresIn.HasValue ? DateTime.UtcNow.AddSeconds(expiresIn.Value) : DateTime.UtcNow.AddDays(60);

            var userInfoResponse = await httpClient.GetAsync($"https://graph.facebook.com/me?fields=id,name,picture&access_token={accessToken}");
            if (!userInfoResponse.IsSuccessStatusCode)
            {
                return new PlatformRedirectResult()
                {
                    Message = $"Facebook user info error: {await userInfoResponse.Content.ReadAsStringAsync()}",
                    IsSuccess = false,
                    StatusCode = 400
                };
            }

            var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<JsonElement>();
            var facebookId = userInfo.GetProperty("id").GetString();

            var displayName = await GetChannelNameAsync();

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
            return new PlatformRedirectResult()
            {
                Message = "Facebook account connected successfully.",
                IsSuccess = true
            };
        }
        catch(Exception ex)
        {
            _logger.LogError("Error handling Facebook redirect: {Message}", ex.Message);
            return new PlatformRedirectResult()
            {
                Message = $"Error connecting Facebook account: {ex.Message}",
                IsSuccess = false,
                StatusCode = (int)HttpStatusCode.InternalServerError
            };
        }
    }

    public Task<string?> UploadVideoAsync(string videoFilePath, string title, string description, List<string> tags, string privacyStatus = "private")
    {
        throw new NotImplementedException();
    }
}
