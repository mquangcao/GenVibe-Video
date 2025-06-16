using Payment.Abstractions;
using Payment.Models;

namespace Payment.Gateway.Momo;

internal class MomoPaymentGateway : IPaymentGateway
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
