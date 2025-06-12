namespace AIGenVideo.Server.Data.Entities;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public UserVipSubscription VipSubscription { get; set; } = default!;
}
