using Payment.Models;

namespace Payment.Abstractions;

public interface IPaymentGateway
{
    Task<PaymentUrlResult> CreatePaymentUrlAsync(PaymentRequest request);
    Task<PaymentResult> ProcessCallbackAsync(Dictionary<string, string> callbackData);
}
