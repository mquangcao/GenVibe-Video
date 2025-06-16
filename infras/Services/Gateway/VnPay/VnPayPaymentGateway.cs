using Payment.Abstractions;
using Payment.Models;

namespace Payment.Gateway.VnPay;

public class VnPayPaymentGateway : IPaymentGateway
{
    public Task<PaymentUrlResult> CreatePaymentUrlAsync(PaymentRequest request)
    {
        throw new NotImplementedException();
    }

    public Task<PaymentResult> ProcessCallbackAsync(Dictionary<string, string> callbackData)
    {
        throw new NotImplementedException();
    }
}
