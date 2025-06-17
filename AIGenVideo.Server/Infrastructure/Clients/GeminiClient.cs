using AIGenVideo.Server.Abstractions.ContentGenerate;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace AIGenVideo.Server.Infrastructure.Clients;

public class GeminiClient : IGeminiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<GeminiClient> _logger;
    private const string Endpoint = "models/gemini-2.0-flash:generateContent";

    public GeminiClient(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiClient> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["ApiKeys:Gemini"];
        _logger = logger;
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new ArgumentNullException(nameof(_apiKey), "Gemini API Key is not configured.");
        }
    }

    public async Task<string> GenerateScriptAsync(string prompt)
    {
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var url = $"{Endpoint}?key={_apiKey}";
        var response = await _httpClient.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Gemini API call failed. Status: {StatusCode}, Response: {ErrorContent}", response.StatusCode, errorContent);
            throw new Exception($"Failed to communicate with Gemini API. Status: {response.StatusCode}");
        }

        var responseString = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseString);
        var result = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return result ?? "No content generated.";
    }

    // Private records to match the actual JSON response structure from Gemini
    private record GeminiApiResponse(List<Candidate> Candidates);
    private record Candidate(Content Content);
    private record Content(List<Part> Parts);
    private record Part(string Text);
}