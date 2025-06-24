namespace AIGenVideo.Server.Abstractions.ImageGenerate
{
    public interface IGeminiImageClient
    {
        Task<string> GenerateImageAsync(string prompt);
    }
}