using AIGenVideo.Server.Abstractions.ImageGenerate;
using System.Text;
using System.Text.Json;

namespace AIGenVideo.Server.Infrastructure.Clients
{
    public class GeminiImageClient : IGeminiImageClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiImageClient> _logger;
        private const string Endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";

        public GeminiImageClient(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiImageClient> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ApiKeys:Gemini"] ?? throw new ArgumentNullException(nameof(_apiKey), "Gemini API Key is not configured.");
            _logger = logger;
        }

        public async Task<string> GenerateImageAsync(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    responseModalities = new[] { "TEXT", "IMAGE" }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var url = $"{Endpoint}?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini Image API call failed. Status: {StatusCode}, Response: {ErrorContent}", response.StatusCode, errorContent);
                throw new Exception($"Failed to communicate with Gemini Image API. Status: {response.StatusCode}");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);

            var inlineData = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")
                                .EnumerateArray()
                                .FirstOrDefault(p => p.TryGetProperty("inlineData", out _));

            if (inlineData.ValueKind == JsonValueKind.Undefined)
            {
                var errorText = doc.RootElement.ToString();
                _logger.LogError("No image data found in Gemini response: {response}", errorText);

                // Try to get a text part for a more descriptive error
                var textPart = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text").GetString();

                if (!string.IsNullOrEmpty(textPart))
                {
                    throw new Exception($"Gemini API returned an error: {textPart}");
                }

                throw new Exception("No image data found in Gemini response.");
            }

            var base64Image = inlineData.GetProperty("inlineData").GetProperty("data").GetString();

            return base64Image ?? string.Empty;
        }
    }
}