using AIGenVideo.Server.Abstractions.VideoGenerate;
using System.Text;
using System.Text.Json;

namespace AIGenVideo.Server.Services.VideoGenerate;

public class AssemblyAiService : ICaptionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AssemblyAiService> _logger;

    public AssemblyAiService(HttpClient httpClient, ILogger<AssemblyAiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> GenerateCaptionsAsync(string audioUrl)
    {
        _logger.LogInformation("Starting transcription for audio URL: {AudioUrl}", audioUrl);

        var requestData = new
        {
            audio_url = audioUrl,
            word_details = true,
            speech_model = "universal"
        };

        var jsonContent = new StringContent(JsonSerializer.Serialize(requestData), Encoding.UTF8, "application/json");

        var submitResponse = await _httpClient.PostAsync("transcript", jsonContent);

        // The rest of this file remains the same. It is correct.
        if (!submitResponse.IsSuccessStatusCode)
        {
            var errorBody = await submitResponse.Content.ReadAsStringAsync();
            _logger.LogError("AssemblyAI submission failed. Status: {StatusCode}, Body: {ErrorBody}", submitResponse.StatusCode, errorBody);
            throw new Exception($"Failed to submit transcription job to AssemblyAI. Response: {errorBody}");
        }

        var submitResponseBody = await submitResponse.Content.ReadAsStringAsync();
        var submitResult = JsonSerializer.Deserialize<JsonElement>(submitResponseBody);

        if (!submitResult.TryGetProperty("id", out var idElement) || idElement.GetString() is null)
        {
            throw new InvalidOperationException("Could not get transcript ID from AssemblyAI response.");
        }
        string transcriptId = idElement.GetString()!;
        _logger.LogInformation("Job submitted successfully. Transcript ID: {TranscriptId}", transcriptId);

        while (true)
        {
            await Task.Delay(3000);
            var pollingResponse = await _httpClient.GetAsync($"transcript/{transcriptId}");

            if (!pollingResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("Polling request for {TranscriptId} failed with status {StatusCode}", transcriptId, pollingResponse.StatusCode);
                continue;
            }

            var pollingResponseBody = await pollingResponse.Content.ReadAsStringAsync();
            var transcriptionResult = JsonSerializer.Deserialize<JsonElement>(pollingResponseBody);

            if (!transcriptionResult.TryGetProperty("status", out var statusElement) || statusElement.GetString() is null)
            {
                throw new InvalidOperationException("Could not get status from polling response.");
            }
            string status = statusElement.GetString()!;
            _logger.LogInformation("Current transcript status for {TranscriptId}: {Status}", transcriptId, status);

            if (status == "completed")
            {
                return transcriptId;
            }
            else if (status == "error")
            {
                string errorMessage = "Unknown error.";
                if (transcriptionResult.TryGetProperty("error", out var errorElement))
                {
                    errorMessage = errorElement.GetString() ?? errorMessage;
                }
                throw new Exception($"Transcription failed: {errorMessage}");
            }
        }
    }
    
    // THÊM MỚI: Phương thức lấy phụ đề định dạng SRT/VTT
    public async Task<string> GetSubtitlesAsync(string transcriptId, string format = "srt")
    {
        if (format != "srt" && format != "vtt")
        {
            throw new ArgumentException("Format must be 'srt' or 'vtt'", nameof(format));
        }

        // AssemblyAI endpoint: GET /transcript/{id}/srt hoặc /vtt
        var response = await _httpClient.GetAsync($"transcript/{transcriptId}/{format}");

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Failed to retrieve {Format} subtitles for Transcript ID: {TranscriptId}. Status: {StatusCode}", format, transcriptId, response.StatusCode);
            throw new Exception($"Failed to get {format} subtitles.");
        }

        // Trả về nội dung file SRT/VTT (dạng string)
        return await response.Content.ReadAsStringAsync();
    }
}