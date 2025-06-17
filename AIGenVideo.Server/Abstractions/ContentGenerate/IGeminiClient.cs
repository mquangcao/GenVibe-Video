namespace AIGenVideo.Server.Abstractions.ContentGenerate;

public interface IGeminiClient
{
   Task<string> GenerateScriptAsync(string topic);
}