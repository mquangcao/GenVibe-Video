namespace AIGenVideo.Server.Abstractions;

public interface IPlatformService
{
    Task<string?> GetChannelNameAsync();
    Task<int> GetSubscriberCountAsync();
    Task<int> GetVideoCountAsync();
    Task<long> GetViewCountAsync();
    Task<string?> GetChannelHandleAsync();
}
