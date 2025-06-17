using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.RequestModels.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;
using Microsoft.Extensions.Logging;

namespace AIGenVideo.Server.Services.ContentGenerate;

public class MainContentGenerationService : IMainContentGenerationService
{
    private readonly IReadOnlyDictionary<string, IContentGenerationStrategy> _strategies;
    private readonly ILogger<MainContentGenerationService> _logger;

    public MainContentGenerationService(IEnumerable<IContentGenerationStrategy> strategies, ILogger<MainContentGenerationService> logger)
    {
        _strategies = strategies.ToDictionary(s => s.ContextName, s => s);
        _logger = logger;
    }

    public async Task<List<SuggestionModel>> GenerateContentAsync(GenerateContentRequest request)
    {
        _logger.LogInformation("Received content generation request - Topic: {Topic}, Context: {Context}", request.Topic, request.Context);
        _logger.LogInformation("Available strategies: {Strategies}", string.Join(", ", _strategies.Keys));

        if (string.IsNullOrEmpty(request.Context))
        {
            _logger.LogWarning("Context is null or empty");
            throw new ArgumentException("Context is required");
        }

        if (string.IsNullOrEmpty(request.Topic))
        {
            _logger.LogWarning("Topic is null or empty");
            throw new ArgumentException("Topic is required");
        }

        if (_strategies.TryGetValue(request.Context, out var strategy))
        {
            _logger.LogInformation("Found strategy for context: {Context}", request.Context);
            return await strategy.GenerateAsync(request.Topic);
        }

        _logger.LogWarning("No strategy found for context: {Context}", request.Context);
        throw new NotSupportedException($"Context '{request.Context}' is not supported.");
    }
}