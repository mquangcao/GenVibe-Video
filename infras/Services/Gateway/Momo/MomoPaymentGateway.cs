using Microsoft.Extensions.Options;
using Payment.Abstractions;
using Payment.Gateway.Momo.Config;
using Payment.Gateway.Momo.Request;
using Payment.Helper;
using Payment.Models;

namespace Payment.Gateway.Momo;

public class MomoPaymentGateway : IPaymentGateway
{
    private readonly MomoConfig _config;
    public MomoPaymentGateway(IOptions<MomoConfig> config)
    {
        _config = config.Value ?? throw new ArgumentNullException(nameof(config));
    }
    public async Task<PaymentUrlResult> CreatePaymentUrlAsync(PaymentRequest request)
    {
        var momoRequest = new MomoCollectionLinkRequest()
        {
            PartnerCode = _config.PartnerCode,
            RequestId = Guid.NewGuid().ToString(),
            Amount = request.Amount,
            OrderId = request.OrderId,
            OrderInfo = TextHelper.NormalizeOrderInfo(request.OrderDescription),
            RedirectUrl = !string.IsNullOrEmpty(request.ReturnUrl) ? (request.ReturnUrl) : _config.ReturnUrl,
            IpnUrl = !string.IsNullOrEmpty(request.NotifyUrl) ? (request.NotifyUrl) : _config.IpnUrl,
            ExtraData = string.Empty,
            RequestType = "payWithMethod",
            Lang = request.Language,
        };

        try
        {
            var (isSuccess, payUrl) = await momoRequest.GetLinkAsync(_config.PaymentUrl, _config.AccessKey, _config.SecretKey);
            return new PaymentUrlResult
            {
                Success = isSuccess,
                PaymentUrl = payUrl,
                ErrorMessage = isSuccess ? null : "Failed to create payment link"
            };
        }
        catch (Exception ex)
        {
            return new PaymentUrlResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public Task<PaymentResult> ProcessCallbackAsync(Dictionary<string, string> callbackData)
    {
        throw new NotImplementedException();
    }
}
