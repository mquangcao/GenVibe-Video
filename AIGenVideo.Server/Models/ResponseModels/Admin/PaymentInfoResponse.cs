namespace AIGenVideo.Server.Models.ResponseModels.Admin;

public class PaymentInfoResponse
{
    public string PaymentId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Gateway { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Name { get; set; } = string.Empty;
}
