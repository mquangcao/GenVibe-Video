using System.Threading.Tasks;

namespace AIGenVideo.Server.Abstractions.ContentGenerate;

public interface IGroqClient
{
    Task<string> GenerateContentAsync(string prompt);
} 