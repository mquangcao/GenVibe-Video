using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Data.Entities;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime? RefreshTokenExpiryTime { get; set; }
    [JsonIgnore]
    public UserVipSubscription VipSubscription { get; set; } = default!;
    [JsonIgnore]
    public ICollection<Payment> Payments { get; set; } = [];
}
