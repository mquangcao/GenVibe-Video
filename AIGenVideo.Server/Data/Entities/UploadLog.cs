using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIGenVideo.Server.Data.Entities;

public class UploadLog
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

    [Required]
    public string VideoId { get; set; } = null!;

    [Required]
    public string VideoDataId { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    [Required]
    public string Description { get; set; } = null!;
    [Required]
    public string Tags { get; set; } = null!;

    [Required]
    public string Status { get; set; } = "pending";

    public string? ErrorMessage { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
