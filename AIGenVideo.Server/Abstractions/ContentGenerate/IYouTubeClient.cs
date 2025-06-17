namespace AIGenVideo.Server.Abstractions.ContentGenerate;

public interface IYouTubeClient
{
    Task<string> GetVideoContentAsync(string topic);
}