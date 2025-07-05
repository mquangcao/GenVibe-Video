using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Abstractions;

public interface IPlatformService
{
    Task<string?> GetChannelNameAsync();
    Task<int> GetSubscriberCountAsync();
    Task<int> GetVideoCountAsync();
    Task<long> GetViewCountAsync();
    Task<string?> GetChannelHandleAsync();
    Task<string?> GetAvatarUrlAsync();
    Task<PlatformInfo> GetPlatFormInfo();
    Task<string?> GetAccessToken();
    Task<string?> GetOAuthUrl(string redirectUrl);
    Task<PlatformRedirectResult> HandlePlatformRedirectAsync(string code, string state, string redirectUrl);
    Task<string?> UploadVideoAsync(string videoFilePath, string title, string description, List<string> tags, string privacyStatus = "private");
}
