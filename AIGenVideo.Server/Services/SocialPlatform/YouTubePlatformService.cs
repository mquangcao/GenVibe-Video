using Microsoft.AspNetCore.Authorization;
using System.Net.Http.Headers;
using System.Text.Json;

namespace AIGenVideo.Server.Services.SocialPlatform;

[Authorize]
public class YouTubePlatformService : IPlatformService
{
    private readonly HttpClient _httpClient;
    private readonly ISocialPlatformService _socialPlatformService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public YouTubePlatformService(IHttpClientFactory httpClientFactory, ISocialPlatformService socialPlatformService, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClientFactory.CreateClient();
        _socialPlatformService = socialPlatformService;
        _httpContextAccessor = httpContextAccessor;
    }

    private async Task<JsonElement> GetChannelDataAsync()
    {
        var userId = _httpContextAccessor.HttpContext?.User?.GetUserId() ?? throw new UnauthorizedAccessException("User is not authenticated.");
        var accessToken = await _socialPlatformService.GetAcessTokenAsync(userId, Constants.YOUTUBE_PLATFORM_CODE);
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

        if (int.TryParse(channel.GetProperty("statistics").GetProperty("videoCount").GetString(), out var subCount))
        {
            return subCount;
        }
        return default;
    }

    public async Task<long> GetViewCountAsync()
    {
        var channel = await GetChannelDataAsync();
        return channel.GetProperty("statistics").GetProperty("viewCount").GetInt64();
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
}
