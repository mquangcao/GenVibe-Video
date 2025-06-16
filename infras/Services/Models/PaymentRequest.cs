namespace Payment.Models;

public class PaymentRequest
{
    public string OrderId { get; set; } = string.Empty;
    public long Amount { get; set; }
    public string OrderDescription { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = string.Empty;
    public string NotifyUrl { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Gateway { get; set; } = string.Empty;
    public string Language { get; set; } = "vi";
}
