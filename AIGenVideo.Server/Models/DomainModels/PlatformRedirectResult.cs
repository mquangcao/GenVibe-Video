namespace AIGenVideo.Server.Models.DomainModels;

public class PlatformRedirectResult
{
    public string Message { get; internal set; }
    public bool IsSuccess { get; internal set; }
    public int StatusCode { get; internal set; }
}
