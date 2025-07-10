namespace AIGenVideo.Server.Models.RequestModels;

public class UploadVideoRequest
{
    public string PlatformCode { get; set; } = default!;
    public string VideoUrl { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string Tags { get; set; } = default!;
    public string VideoId { get; set; } = default!;
}

