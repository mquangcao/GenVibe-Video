using AIGenVideo.Server.Models.DomainModels;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Data.Entities;

public class UserSocialAccount
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string UserId { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public AppUser User { get; set; } = null!;

    [Required]
    public string PlatformId { get; set; } = null!;

    [ForeignKey(nameof(PlatformId))]
    public Platform Platform { get; set; } = null!;

    [Required, MaxLength(100)]
    public string ExternalUserId { get; set; } = null!;

    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = null!;

    [Required]
    public string AccessToken { get; set; } = null!;

    [Required]
    public string RefreshToken { get; set; } = null!;

    public DateTime TokenExpiry { get; set; }

    [Required]
    public string Scopes { get; set; } = null!;

    public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastRefreshedAt { get; set; }
    public bool IsRevoked { get; set; } = false;
}
