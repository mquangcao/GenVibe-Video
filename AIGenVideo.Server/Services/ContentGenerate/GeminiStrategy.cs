using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace AIGenVideo.Server.Services.ContentGenerate;

public class GeminiStrategy : IContentGenerationStrategy
{
    private readonly IGeminiClient _geminiClient;
    public string ContextName => "Gemini";

    private record GeminiContentModel(string imagePrompt, string ContentText);

    public GeminiStrategy(IGeminiClient geminiClient)
    {
        _geminiClient = geminiClient;

    }

    public async Task<List<SuggestionModel>> GenerateAsync(string topic)
    {
        var advancedPrompt = @$"
            Generate a script for a 30-second video about ""{topic}"".
            Your response must be ONLY a valid JSON array. Each object in the array represents a scene and MUST contain exactly two string fields:
            - ""imagePrompt"": realistic image generation prompt describing the scene's visuals.
            - ""ContentText"": A detailed, The narration or dialogue for the scene.

            Strict requirements:
            - Do NOT include any text, explanation, markdown, or formatting before or after the JSON array.
            - Every object in the array MUST have both ""imagePrompt"" and ""ContentText"" fields, both as non-empty strings.
            - Use double quotes for all property names and string values.
            - The response must be valid JSON and parseable as an array of objects.

           
        ";

        var rawResponse = await _geminiClient.GenerateScriptAsync(advancedPrompt);

        // This block cleans the response and extracts the pure JSON part
        string jsonArray;
        try
        {
            var firstBracket = rawResponse.IndexOf('[');
            var lastBracket = rawResponse.LastIndexOf(']');
            if (firstBracket == -1 || lastBracket == -1)
            {
                // Handle error...
                return new List<SuggestionModel>();
            }
            jsonArray = rawResponse.Substring(firstBracket, lastBracket - firstBracket + 1);
        }
        catch { /* Handle error */ return new List<SuggestionModel>(); }

        // This block deserializes the JSON string into a C# List
        List<GeminiContentModel>? generatedScenes;
        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            generatedScenes = JsonSerializer.Deserialize<List<GeminiContentModel>>(jsonArray, options);
        }
        catch { /* Handle error */ return new List<SuggestionModel>(); }

        if (generatedScenes == null) return new List<SuggestionModel>();

        // This block maps the fields exactly as you want
        var suggestions = generatedScenes.Select((scene, index) => new SuggestionModel
        {
            Id = Guid.NewGuid().ToString(),
            Title = scene.imagePrompt,   // ImagePrompt -> Title
            Summary = scene.ContentText  // ContentText -> Summary
        }).ToList();

        return suggestions;
    }
}