using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;
using System.Net.Http.Json;
using System.Text.Json;

namespace AIGenVideo.Server.Services.ContentGenerate;

public class WikipediaStrategy : IContentGenerationStrategy
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WikipediaStrategy> _logger;

    public string ContextName => "Wikipedia";

    public WikipediaStrategy(HttpClient httpClient, ILogger<WikipediaStrategy> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<List<SuggestionModel>> GenerateAsync(string topic)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"https://en.wikipedia.org/w/rest.php/v1/search/title?q={Uri.EscapeDataString(topic)}&limit=15");


            var content = await response.Content.ReadFromJsonAsync<WikipediaResponse>();

            if (content?.Pages == null || !content.Pages.Any())
            {
                return new List<SuggestionModel>
                {
                    new SuggestionModel
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = $"Wikipedia Content for topic '{topic}'",
                        Summary = "No suggestions found. Please try a different topic."
                    }
                };
            }

            return content.Pages.Select(page => new SuggestionModel
            {
                Id = page.Id.ToString(),
                Title = page.Title,
                Summary = ""
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in WikipediaStrategy while generating content");
            throw;
        }
    }

    private class WikipediaResponse
    {
        public List<WikipediaPage> Pages { get; set; } = new();
    }

    private class WikipediaPage
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}