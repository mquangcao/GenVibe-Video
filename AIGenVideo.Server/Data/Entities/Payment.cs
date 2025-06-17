using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Data.Entities;

public class Payment
{
    [Key]
    public string PaymentId { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;
    public string? PackageId { get; set; }

    [JsonIgnore]
    [ForeignKey("PackageId")]
    public VipPlan? Package { get; set; } = default!;

    [JsonIgnore]
    [ForeignKey("UserId")]
    public AppUser User { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    public string RefId { get; set; } = string.Empty; 

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "VND";

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "pending"; // pending, success, failed, expired

    [MaxLength(100)]
    public string Gateway { get; set; } = string.Empty;

    [MaxLength(255)]
    public string Description { get; set; } = string.Empty;
    public string? GatewayTransactionId { get; set; }
    public string? ReturnUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PaidAt { get; set; }

    public DateTime? ExpireAt { get; set; }
}
