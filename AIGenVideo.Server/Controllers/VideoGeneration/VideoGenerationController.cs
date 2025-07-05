using AIGenVideo.Server.Abstractions.VideoGenerate;
using Microsoft.AspNetCore.Mvc;

namespace AIGenVideo.Server.Controllers.VideoGeneration;

[ApiController]
[Route("api/[controller]")]
public class VideoGenerationController : ControllerBase
{
    private readonly IVideoService _videoService; 
    private readonly ILogger<VideoGenerationController> _logger;

    public VideoGenerationController(IVideoService videoService, ILogger<VideoGenerationController> logger)
    {
        _videoService = videoService;
        _logger = logger;
    }

    [HttpPost("{videoId}/generate-captions")]
    public async Task<IActionResult> GenerateCaptions(string videoId)
    {
        try
        {
            _logger.LogInformation("Received request to generate captions for VideoId: {VideoId}", videoId);

            var success = await _videoService.GenerateAndSaveCaptionsAsync(videoId);

            if (!success)
            {
                return NotFound(new { success = false, message = $"Video with ID {videoId} not found." });
            }

            _logger.LogInformation("Caption generation completed successfully for VideoId: {VideoId}", videoId);

            // Trả về thành công. Client có thể gọi API GetVideoDetails để lấy phụ đề mới.
            return Ok(new { success = true, message = "Captions generated and saved successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating captions for VideoId: {VideoId}", videoId);
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}
