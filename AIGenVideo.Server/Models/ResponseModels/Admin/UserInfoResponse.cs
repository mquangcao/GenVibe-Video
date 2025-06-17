namespace AIGenVideo.Server.Models.ResponseModels.Admin;

public class UserInfoResponse
{
    public string Id { get; internal set; } = string.Empty;
    public string Email { get; internal set; } = string.Empty;
    public string FullName { get; internal set; } = string.Empty;
    public string Role { get; internal set; } = string.Empty;
    public DateTime? VipExpries { get; internal set; }
    public bool IsLocked { get; internal set; }
}
