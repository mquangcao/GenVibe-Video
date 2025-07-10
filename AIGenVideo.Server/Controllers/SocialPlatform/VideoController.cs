using AIGenVideo.Server.Services.SocialPlatform;
using Google.Apis.YouTube.v3;
using Microsoft.AspNetCore.Authorization;

namespace AIGenVideo.Server.Controllers.SocialPlatform;

[Route("api/[controller]")]
[ApiController]
public class VideoController : ControllerBase
{
    private readonly YouTubePlatformService _youTubePlatformService;

    public VideoController(YouTubePlatformService youTubePlatformService)
    {
        _youTubePlatformService = youTubePlatformService;
    }

    
    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadVideo([FromBody] UploadVideoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.VideoUrl))
        {
            return BadRequest("No video URL provided.");
        }

        // Tạo đường dẫn tạm để lưu video tải về
        var filePath = Path.GetTempFileName();

        try
        {
            // Tải video từ URL
            using (var httpClient = new HttpClient())
            {
                using var stream = await httpClient.GetStreamAsync(request.VideoUrl);
                using var fileStream = new FileStream(filePath, FileMode.Create);
                await stream.CopyToAsync(fileStream);
            }

            var tagList = request.Tags.Split(',').Select(t => t.Trim()).ToList();
            var videoId = await _youTubePlatformService.UploadVideoAsync(
                filePath, request.Title, request.Description, tagList, "public");

            System.IO.File.Delete(filePath);

            if (!string.IsNullOrEmpty(videoId))
            {
                return Ok($"Video uploaded successfully! Video ID: {videoId}");
            }
            else
            {
                return StatusCode(500, "Failed to upload video.");
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            System.IO.File.Delete(filePath);
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            System.IO.File.Delete(filePath);
            return StatusCode(500, $"An error occurred during video upload: {ex.Message}");
        }
    }

    [Authorize]
    [HttpGet("analytics/{videoId}")]
    public async Task<IActionResult> GetVideoAnalytics([FromRoute] string videoId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        if (string.IsNullOrWhiteSpace(videoId))
            return BadRequest("Missing videoId.");

        try
        {
            var analytics = await _youTubePlatformService.GetVideoAnalyticsAsync(videoId, startDate, endDate);
            if (analytics == null)
                return NotFound("No analytics data found.");

            return Ok(analytics);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("User not authenticated.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

}