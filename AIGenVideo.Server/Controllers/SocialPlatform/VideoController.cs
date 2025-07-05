using AIGenVideo.Server.Services.SocialPlatform;

namespace AIGenVideo.Server.Controllers.SocialPlatform
{
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
        public async Task<IActionResult> UploadVideo([FromForm] UploadVideoRequest request)
        {
            if (request.VideoFile == null || request.VideoFile.Length == 0)
            {
                return BadRequest("No video file uploaded.");
            }

            // Lưu file tạm thời vào đĩa để có đường dẫn
            var filePath = Path.GetTempFileName();
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.VideoFile.CopyToAsync(stream);
            }

            try
            {
                var tagList = request.Tags.Split(',').Select(t => t.Trim()).ToList();
                var videoId = await _youTubePlatformService.UploadVideoAsync(filePath, request.Title, request.Description, tagList, "public"); // Ví dụ public

                // Xóa file tạm thời sau khi tải lên
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
                // Xóa file tạm thời nếu có lỗi
                System.IO.File.Delete(filePath);
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                // Xóa file tạm thời nếu có lỗi
                System.IO.File.Delete(filePath);
                return StatusCode(500, $"An error occurred during video upload: {ex.Message}");
            }
        }
    }
}
