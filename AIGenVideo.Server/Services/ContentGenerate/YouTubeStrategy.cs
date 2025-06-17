using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;

namespace AIGenVideo.Server.Services.ContentGenerate;

public class YouTubeStrategy : IContentGenerationStrategy
{
    private readonly IYouTubeClient _youTubeClient;
    private readonly ILogger<YouTubeStrategy> _logger;

    public string ContextName => "YouTube";

    public YouTubeStrategy(IYouTubeClient youTubeClient) => _youTubeClient = youTubeClient;

    public async Task<List<SuggestionModel>> GenerateAsync(string topic)
    {
        try
        {
            var content = await _youTubeClient.GetVideoContentAsync(topic);
            if (string.IsNullOrEmpty(content))
            {
                return new List<SuggestionModel>();
            }

            // Split by double newlines to get individual entries
            var entries = content.Split(new[] { "\r\n\r\n", "\n\n" }, StringSplitOptions.RemoveEmptyEntries);
            var suggestions = new List<SuggestionModel>();

            for (int i = 0; i < entries.Length; i++)
            {
                var entry = entries[i].Trim();
                if (entry.StartsWith("Title: "))
                {
                    var title = entry.Replace("Title: ", "").Trim();
                    suggestions.Add(new SuggestionModel
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = $"{i + 1}. {title}",
                        Summary = ""
                    });
                }
            }

            return suggestions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in YouTubeStrategy while generating content for topic: {Topic}", topic);
            throw;
        }
    }
}