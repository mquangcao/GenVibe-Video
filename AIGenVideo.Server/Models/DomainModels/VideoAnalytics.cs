namespace AIGenVideo.Server.Models.DomainModels;

public class VideoAnalytics
{
    public VideoStats BasicStats { get; set; } = new();
    public long EstimatedMinutesWatched { get; set; }
    public double AverageViewDurationSeconds { get; set; }
    public double AverageViewPercentage { get; set; }
    public int SubscribersGained { get; set; }
    public List<VideoChartPoint> ChartData { get; set; } = new();
}
