using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Abstractions.ContentGenerate;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace AIGenVideo.Server.Infrastructure.Clients;

public class YouTubeClient : IYouTubeClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<YouTubeClient> _logger;

    public YouTubeClient(HttpClient httpClient, IConfiguration configuration, ILogger<YouTubeClient> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["ApiKeys:YouTube"];
        _logger = logger;

        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new ArgumentException("YouTube API key is not configured");
        }
    }

    public async Task<string> GetVideoContentAsync(string topic)
    {
        try
        {
            _logger.LogInformation("Fetching YouTube content for topic: {Topic}", topic);

            var url = $"search?part=snippet&q={Uri.EscapeDataString(topic)}" +
                     $"&maxResults=15" +
                     $"&type=video" +
                     $"&videoDuration=medium" +
                     $"&relevanceLanguage=en" +
                     $"&order=relevance" +
                     $"&key={_apiKey}";

            _logger.LogDebug("Making request to YouTube API: {Url}", url);

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("YouTube API Response: {Response}", jsonString);

            var content = JsonSerializer.Deserialize<YouTubeSearchResponse>(jsonString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (content?.Items == null || !content.Items.Any())
            {
                _logger.LogWarning("No YouTube videos found for topic: {Topic}", topic);
                return string.Empty;
            }

            var contentBuilder = new StringBuilder();

            foreach (var item in content.Items)
            {
                if (!string.IsNullOrEmpty(item.Snippet?.Title))
                {
                    contentBuilder.AppendLine($"Title: {item.Snippet.Title}");
                    contentBuilder.AppendLine(); // Add a blank line between entries
                }
            }

            var result = contentBuilder.ToString();
            _logger.LogInformation("Generated {Count} video entries", content.Items.Count);
            return result;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error making request to YouTube API for topic: {Topic}. Status code: {StatusCode}", topic, ex.StatusCode);
            throw new Exception($"Failed to fetch YouTube content: {ex.Message}");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Error parsing YouTube API response for topic: {Topic}. Error: {Error}", topic, ex.Message);
            throw new Exception($"Failed to parse YouTube API response: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while fetching YouTube content for topic: {Topic}", topic);
            throw;
        }
    }

    private class YouTubeSearchResponse
    {
        [JsonPropertyName("items")]
        public List<YouTubeItem> Items { get; set; }
    }

    private class YouTubeItem
    {
        [JsonPropertyName("snippet")]
        public YouTubeSnippet Snippet { get; set; }
    }

    private class YouTubeSnippet
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }
    }
}