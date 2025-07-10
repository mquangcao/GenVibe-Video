namespace AIGenVideo.Server.Models.DomainModels;

public class VideoStats
{
    public string VideoId { get; set; } = string.Empty;
    public long ViewCount { get; set; }
    public long LikeCount { get; set; }
    public long CommentCount { get; set; }
}
