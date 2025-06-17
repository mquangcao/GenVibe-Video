namespace AIGenVideo.Server.Models.ResponseModels;

public class PaymentResponse
{
    public string Name { get; internal set; } = string.Empty;
    public decimal Price { get; internal set; }
    public string PaymentMethod { get; internal set; } = string.Empty;
}
