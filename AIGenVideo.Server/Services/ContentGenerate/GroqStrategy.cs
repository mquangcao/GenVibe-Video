using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;

namespace AIGenVideo.Server.Services.ContentGenerate;

public class GroqStrategy : IContentGenerationStrategy
{
    private readonly IGroqClient _groqClient;
    private readonly ILogger<GroqStrategy> _logger;

    public string ContextName => "Groq";

    public GroqStrategy(IGroqClient groqClient, ILogger<GroqStrategy> logger)
    {
        _groqClient = groqClient;
        _logger = logger;
    }

    public async Task<List<SuggestionModel>> GenerateAsync(string topic)
    {
        try
        {
            var advancedPrompt = @$"
            Generate a list of exactly 15 topics related to ""{topic}"". Each topic should be a short sentence.
            Format the response as a numbered list (1-15).
            ";
            var content = await _groqClient.GenerateContentAsync(advancedPrompt);

            _logger.LogInformation($"Received content from Groq: {content}");

            // Split the content into lines and filter for numbered items
            var lines = content.Split('\n')
                .Where(line => line.Trim().StartsWith("1.") ||
                             line.Trim().StartsWith("2.") ||
                             line.Trim().StartsWith("3.") ||
                             line.Trim().StartsWith("4.") ||
                             line.Trim().StartsWith("5.") ||
                             line.Trim().StartsWith("6.") ||
                             line.Trim().StartsWith("7.") ||
                             line.Trim().StartsWith("8.") ||
                             line.Trim().StartsWith("9.") ||
                             line.Trim().StartsWith("10.") ||
                             line.Trim().StartsWith("11.") ||
                             line.Trim().StartsWith("12.") ||
                             line.Trim().StartsWith("13.") ||
                             line.Trim().StartsWith("14.") ||
                             line.Trim().StartsWith("15."))
                .ToList();

            // Convert each line into a SuggestionModel
            return lines.Select((line, index) => new SuggestionModel
            {
                Id = Guid.NewGuid().ToString(),
                Title = line.Trim(), // The line already includes the number
                Summary = ""
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GroqStrategy while generating content");
            throw;
        }
    }
}