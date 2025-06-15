using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Data.Entities;

public class UserVipSubscription
{
    [Key]
    public string UserId { get; set; } = new Guid().ToString();
    [ForeignKey(nameof(UserId))]
    [JsonIgnore]
    public AppUser User { get; set; } = default!;

    public DateTime StartDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    public bool IsActive => ExpirationDate > DateTime.UtcNow;
}
