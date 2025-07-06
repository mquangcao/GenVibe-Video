using AIGenVideo.Server.Abstractions.VideoGenerate;
using AIGenVideo.Server.Data;
using AIGenVideo.Server.Data.Entities;
using AIGenVideo.Server.Models.RequestModels.VideoGeneration;
using AIGenVideo.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace AIGenVideo.Server.Controllers.VideoGeneration
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VideoGenerationController : ControllerBase
    {
        private readonly ILogger<VideoGenerationController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly ICaptionService _captionService;
        private readonly CloudinaryService _cloudinaryService;

        public VideoGenerationController(
            ILogger<VideoGenerationController> logger,
            ApplicationDbContext context,
            ICaptionService captionService,
            CloudinaryService cloudinaryService)
        {
            _logger = logger;
            _context = context;
            _captionService = captionService;
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("generate-captions-from-file")]
        [RequestSizeLimit(100_000_000)]
        public async Task<IActionResult> GenerateCaptionsFromFile([FromForm] IFormFile audioFile)
        {
            if (audioFile == null || audioFile.Length == 0) return BadRequest(new { success = false, error = "No audio file provided." });
            _logger.LogInformation("Received audio file for caption generation: {FileName}", audioFile.FileName);
            
            var uploadResult = await _cloudinaryService.UploadFileAsync(audioFile, "temp-audio");
            if (!uploadResult.IsSuccess) return StatusCode(500, new { success = false, error = $"Upload failed: {uploadResult.ErrorMessage}" });

            try
            {
                string transcriptId = await _captionService.GenerateCaptionsAsync(uploadResult.Url!);
                string srtContent = await _captionService.GetSubtitlesAsync(transcriptId, "srt");
                return Ok(new { success = true, srts = srtContent });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Caption generation failed.");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
            finally
            {
                await _cloudinaryService.DeleteFileAsync(uploadResult.PublicId!);
            }
        }

        [HttpPost("save-full-video")]
        [RequestSizeLimit(500_000_000)]
        public async Task<IActionResult> SaveFullVideo([FromForm] SaveVideoRequest request)
        {
            var videoUploadResult = await _cloudinaryService.UploadFileAsync(request.VideoFile, "videos");
            if (!videoUploadResult.IsSuccess) return StatusCode(500, new { success = false, error = "Video upload failed." });
            
            var srtBytes = System.Text.Encoding.UTF8.GetBytes(request.Srts);
            using var srtStream = new MemoryStream(srtBytes);
            var srtFormFile = new FormFile(srtStream, 0, srtStream.Length, "subtitles", "subtitles.srt");
            var srtUploadResult = await _cloudinaryService.UploadFileAsync(srtFormFile, "subtitles");

            if (!srtUploadResult.IsSuccess)
            {
                await _cloudinaryService.DeleteFileAsync(videoUploadResult.PublicId!);
                return StatusCode(500, new { success = false, error = "Subtitle upload failed." });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            try
            {
                var newVideoData = new VideoData
                {
                    VideoUrl = videoUploadResult.Url!,
                    AudioFileUrl = request.AudioFileUrl,
                    Captions = request.Captions,
                    Srts = srtUploadResult.Url!,
                    ImageListUrl = JsonSerializer.Deserialize<List<string>>(request.ImageListUrl) ?? new List<string>(),
                    CreatedBy = userId
                };
                _context.VideoData.Add(newVideoData);
                await _context.SaveChangesAsync();
                
                return Ok(new { success = true, data = new { id = newVideoData.Id, videoUrl = newVideoData.VideoUrl } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving video data.");
                await _cloudinaryService.DeleteFileAsync(videoUploadResult.PublicId!);
                await _cloudinaryService.DeleteFileAsync(srtUploadResult.PublicId!);
                return StatusCode(500, new { success = false, error = "Error saving video data." });
            }
        }
    }
}