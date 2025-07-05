using AIGenVideo.Server.Abstractions.VideoGenerate;
using AIGenVideo.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace AIGenVideo.Server.Services.VideoGenerate
{
    public class VideoService : IVideoService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICaptionService _captionService;
        private readonly ILogger<VideoService> _logger;

        public VideoService(ApplicationDbContext context, ICaptionService captionService, ILogger<VideoService> logger)
        {
            _context = context;
            _captionService = captionService;
            _logger = logger;
        }

        public async Task<bool> GenerateAndSaveCaptionsAsync(string videoId)
        {
            // 1. Lấy video từ DB
            var video = await _context.VideoData.FindAsync(videoId);
            if (video == null)
            {
                _logger.LogWarning("Video not found: {VideoId}", videoId);
                return false;
            }

            // 2. Gọi AssemblyAI để bắt đầu phiên mã (sử dụng AudioFileUrl hoặc VideoUrl)
            // Ở đây dùng AudioFileUrl theo Entity của bạn
            _logger.LogInformation("Starting caption generation for VideoId: {VideoId}", videoId);
            string transcriptId = await _captionService.GenerateCaptionsAsync(video.AudioFileUrl);

            // 3. Lấy kết quả phụ đề định dạng SRT
            string srtContent = await _captionService.GetSubtitlesAsync(transcriptId, "srt");

            // 4. Cập nhật vào DB
            video.Srts = srtContent;

            _context.VideoData.Update(video);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully generated and saved captions for VideoId: {VideoId}", videoId);
            return true;
        }
    }
}