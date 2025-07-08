using AIGenVideo.Server.Abstractions.VideoGenerate;
using Microsoft.AspNetCore.Mvc;

namespace AIGenVideo.Server.Controllers.VideoGeneration;

[ApiController]
[Route("api/[controller]")]
public class VideoGenerationController : ControllerBase
{
    private readonly ICaptionService _captionService;
    private readonly ILogger<VideoGenerationController> _logger;

    public VideoGenerationController(ICaptionService captionService, ILogger<VideoGenerationController> logger)
    {
        _captionService = captionService;
        _logger = logger;
    }

    [HttpPost("generate-captions")]
    public async Task<IActionResult> GenerateCaptions([FromBody] GenerateCaptionsRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.audioUrl))
            {
                return BadRequest(new { success = false, error = "Audio URL is required" });
            }

            _logger.LogInformation("Starting caption generation for URL: {audioUrl}", request.audioUrl);

            var captions = await _captionService.GenerateCaptionsAsync(request.audioUrl);

            _logger.LogInformation("Caption generation completed successfully");

            return Ok(new { success = true, captions = captions });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating captions for URL: {audioUrl}", request.audioUrl);
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}

public class GenerateCaptionsRequest
{
    public string audioUrl { get; set; } = string.Empty;
}