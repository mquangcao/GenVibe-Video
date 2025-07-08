using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Data.Entities;

public class Platform
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required, MaxLength(50)]
    public string Code { get; set; } = default!;

    [Required, MaxLength(100)]
    public string Name { get; set; } = default!;

    [Required]
    public string OAuthUrl { get; set; } = default!;

    [Required]
    public string ApiBaseUrl { get; set; } = default!;

    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<UserSocialAccount> UserSocialAccounts { get; set; } = new List<UserSocialAccount>();
}
