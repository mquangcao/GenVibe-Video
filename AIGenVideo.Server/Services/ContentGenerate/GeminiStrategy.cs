using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;

namespace AIGenVideo.Server.Services.ContentGenerate;

public class GeminiStrategy : IContentGenerationStrategy
{
    private readonly IGeminiClient _geminiClient;
    public string ContextName => "Gemini";

    public GeminiStrategy(IGeminiClient geminiClient)
    {
        _geminiClient = geminiClient;

    }

    public async Task<List<SuggestionModel>> GenerateAsync(string topic)
    {
        var advancedPrompt = @$"
        Write a short script (about 100 words) to generate a video for the topic: ""{topic}"".
        ";

        var generatedScript = await _geminiClient.GenerateScriptAsync(advancedPrompt);
        return new List<SuggestionModel>
        {
            new SuggestionModel
            {
                Id = Guid.NewGuid().ToString(),
                Title = $"AI Script for topic '{topic}'",
                Summary = generatedScript
            }
        };
    }
}