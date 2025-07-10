using AIGenVideo.Server.Services.SocialPlatform;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace AIGenVideo.Server.Controllers.SocialPlatform;

[Route("api/[controller]")]
[ApiController]
public class VideoController : ControllerBase
{
    private readonly YouTubePlatformService _youTubePlatformService;
    private readonly ApplicationDbContext _dbContext;
    public VideoController(YouTubePlatformService youTubePlatformService, ApplicationDbContext dbContext)
    {
        _youTubePlatformService = youTubePlatformService;
        _dbContext = dbContext;
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

    [HttpGet("my-videos")]
    [Authorize] 
    public async Task<IActionResult> GetMyVideos()
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID is missing.");
        }

        // Lấy các video do người dùng tạo
        var videos = await _dbContext.VideoData
            .Where(v => v.CreatedBy == userId)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        // Map dữ liệu sang DTO phù hợp
        var result = videos.Select(v => new
        {
            id = v.Id,
            caption = v.Captions,
            videoUrl = v.VideoUrl,
            createdAt = v.CreatedAt.ToString("yyyy-MM-dd")
        });

        return Ok(ApiResponse.SuccessResponse(result));
    }

    [HttpGet("my-videos/{id}")]
    [Authorize]
    public async Task<IActionResult> GetVideoById(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID is missing.");
        }

        // Tìm video theo ID và người tạo
        var video = await _dbContext.VideoData
            .FirstOrDefaultAsync(v => v.Id == id && v.CreatedBy == userId);

        if (video == null)
        {
            return NotFound("Video not found or you do not have access.");
        }

        var result = new
        {
            id = video.Id,
            caption = video.Captions,
            videoUrl = video.VideoUrl,
            createdAt = video.CreatedAt.ToString("yyyy-MM-dd")
        };

        return Ok(ApiResponse.SuccessResponse(result));
    }

    [HttpPut("my-videos/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateVideoUrl(string id, [FromBody] UpdateVideoUrlRequest request)
    {
        var userId = User.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID is missing.");
        }

        var video = await _dbContext.VideoData
            .FirstOrDefaultAsync(v => v.Id == id && v.CreatedBy == userId);

        if (video == null)
        {
            return NotFound("Video not found or you do not have permission to update.");
        }

        video.VideoUrl = request.VideoUrl;
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
    public class UpdateVideoUrlRequest
    {
        [Required]
        public string VideoUrl { get; set; } = default!;
    }

}