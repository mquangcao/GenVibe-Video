namespace AIGenVideo.Server.Models.DomainModels;

public sealed class SendEmailResult(bool success, string message = "")
{
    public bool Success { get; } = success;
    public string Message { get; } = message;
}
