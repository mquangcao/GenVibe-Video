namespace Payment.Models;

public class PaymentUrlResult
{
    public bool Success { get; set; }
    public string PaymentUrl { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}
