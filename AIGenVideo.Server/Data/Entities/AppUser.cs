namespace AIGenVideo.Server.Data.Entities;

public class AppUser : IdentityUser
{
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime? RefreshTokenExpiryTime { get; set; }
}
