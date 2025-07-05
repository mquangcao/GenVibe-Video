namespace AIGenVideo.Server.Abstractions.VideoGenerate
{
    public interface IVideoService
    {
        Task<bool> GenerateAndSaveCaptionsAsync(string videoId);
    }
}