using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;

namespace AIGenVideo.Server.Abstractions.ContentGenerate;

public interface IContentGenerationStrategy
{
    string ContextName { get; }
    Task<List<SuggestionModel>> GenerateAsync(string topic);
}