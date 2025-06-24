namespace AIGenVideo.Server.Abstractions.VideoGenerate;

public interface ICaptionService
{

    Task<string> GenerateCaptionsAsync(string audioUrl);
}