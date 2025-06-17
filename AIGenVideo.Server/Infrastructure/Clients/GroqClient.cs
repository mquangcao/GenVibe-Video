using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Bootstraping.ContentGenerate;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Infrastructure.Clients;

public class GroqClient : IGroqClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<GroqClient> _logger;

    public GroqClient(HttpClient httpClient, IConfiguration configuration, ILogger<GroqClient> logger)
    {
        _httpClient = httpClient;
        _apiKey = configuration["ApiKeys:Groq"];
        _logger = logger;
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new ArgumentNullException(nameof(_apiKey), "Groq API Key is not configured.");
        }

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }


    public async Task<string> GenerateContentAsync(string prompt)
    {
        try
        {
            var request = new
            {
                model = "deepseek-r1-distill-llama-70b",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(request),
                Encoding.UTF8,
                "application/json");

            _logger.LogInformation($"Sending request to Groq API: {JsonSerializer.Serialize(request)}");

            var response = await _httpClient.PostAsync("openai/v1/chat/completions", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Groq API error: {response.StatusCode} - {errorContent}");
            }

            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation($"Received response from Groq API: {responseContent}");

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var result = JsonSerializer.Deserialize<GroqResponse>(responseContent, options);

            if (result?.Choices == null || !result.Choices.Any())
            {
                _logger.LogWarning($"No choices returned from Groq API. Full response: {responseContent}");
                return string.Empty;
            }

            var messageContent = result.Choices[0].Message?.Content;
            _logger.LogInformation($"Extracted message content: {messageContent}");

            return messageContent ?? string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating content with Groq API");
            throw;
        }
    }

    private class GroqResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("object")]
        public string Object { get; set; }

        [JsonPropertyName("created")]
        public long Created { get; set; }

        [JsonPropertyName("model")]
        public string Model { get; set; }

        [JsonPropertyName("choices")]
        public List<Choice> Choices { get; set; }

        [JsonPropertyName("usage")]
        public Usage Usage { get; set; }
    }

    private class Choice
    {
        [JsonPropertyName("index")]
        public int Index { get; set; }

        [JsonPropertyName("message")]
        public Message Message { get; set; }

        [JsonPropertyName("finish_reason")]
        public string FinishReason { get; set; }
    }

    private class Message
    {
        [JsonPropertyName("role")]
        public string Role { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }
    }

    private class Usage
    {
        [JsonPropertyName("prompt_tokens")]
        public int PromptTokens { get; set; }

        [JsonPropertyName("completion_tokens")]
        public int CompletionTokens { get; set; }

        [JsonPropertyName("total_tokens")]
        public int TotalTokens { get; set; }
    }
}