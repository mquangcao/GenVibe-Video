using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Models.ResponseModels;

public class VideoPlatformStatusResponse
{
    public string PlatformCode { get; set; } = null!;
    public bool IsConnect { get; set; }
    public bool IsPublish { get; set; }
    public string VideoId { get; set; } = string.Empty;

    // Thông tin nếu đã upload
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; } // success, pending, failed
    public string? ErrorMessage { get; set; }
    public DateTime? CreatedAt { get; set; }
    public VideoAnalytics analytics { get; set; } = new VideoAnalytics();
}
