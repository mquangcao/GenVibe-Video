
namespace AIGenVideo.Server.Models.ResponseModels.Admin;

public class UserListResponse
{
    public string Id { get; internal set; }
    public string FullName { get; internal set; }
    public string? Email { get; internal set; }
    public string Role { get; internal set; }
    public string VipExpries { get; internal set; }
    public bool IsLocked { get; internal set; }
}
