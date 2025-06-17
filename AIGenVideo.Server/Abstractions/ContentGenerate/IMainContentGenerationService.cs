using AIGenVideo.Server.Models.RequestModels.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;

namespace AIGenVideo.Server.Abstractions.ContentGenerate;

public interface IMainContentGenerationService
{
    Task<List<SuggestionModel>> GenerateContentAsync(GenerateContentRequest request);
}