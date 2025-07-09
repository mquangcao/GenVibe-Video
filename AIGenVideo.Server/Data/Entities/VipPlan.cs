using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Data.Entities;

public class VipPlan
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal Savings { get; set; } 
    public string Currency { get; set; } = "VND";
    public string Period { get; set; } = "Month";
    public int DurationInMonths { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
