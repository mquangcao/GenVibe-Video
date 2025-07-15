using AIGenVideo.Server.Models.Configurations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace AIGenVideo.Server.Controllers.VideoGeneration;

[ApiController]
[Route("api/saveVideo")]
public class ImagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ImagesController> _logger;
    private readonly GoogleGeminiOptions _geminiOptions;
    private static readonly HttpClient httpClient = new HttpClient();
    public ImagesController(ILogger<ImagesController> logger, ApplicationDbContext context, IOptions<GoogleGeminiOptions> geminiOptions)
    {
        _context = context;
        _logger = logger;
        _geminiOptions = geminiOptions.Value;
    }


    [HttpPost("save-video-data")]
    [Authorize]
    public async Task<IActionResult> SaveFullVideoData([FromBody] VideoData requestData)
    {
        try
        {
            if (requestData == null)
            {
                return BadRequest("No data provided.");
            }

            requestData.CreatedBy = HttpContext.User.GetUserId();
            requestData.Title = await GenerateVideoTitleAsync(requestData.Captions, _geminiOptions.ApiKey);

            requestData.Id = Guid.NewGuid().ToString();

            _context.VideoData.Add(requestData);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Full video data saved successfully", videoId = requestData.Id });
        }
        catch (ArgumentNullException)
        {
            _logger.LogError("Invalid input data provided for saving video data.");
            return BadRequest(new { success = false, message = "Invalid input data." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving full video data");
            return StatusCode(500, new { success = false, message = "An error occurred while saving video data." });
        }
    }

    private async Task<string> GenerateVideoTitleAsync(string? transcript, string apiKey)
    {
        ArgumentNullException.ThrowIfNull(transcript, nameof(transcript));
        var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        string prompt = $@"
            You are a professional YouTube content strategist.

            Given the full transcript of a video below, write a short, engaging, and clickable video title (maximum 100 characters). The title should reflect the core idea of the video and attract viewers to click.

            The transcript may be in English or Vietnamese. Please write the title in the **same language** as the transcript.

            Transcript:
            {transcript}
        ".Trim();

        var requestBody = new
        {
            contents = new[]
            {
                new {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = content
        };

        request.Headers.Add("X-goog-api-key", _geminiOptions.ApiKey);

        var response = await httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Request failed: {response.StatusCode} - {errContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(responseContent);
        var title = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return title?.Trim() ?? "Không t?o ???c tiêu ??.";
    }

}