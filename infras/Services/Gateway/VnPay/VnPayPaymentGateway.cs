using Payment.Abstractions;
using Payment.Gateway.VnPay.Common;
using Payment.Gateway.VnPay.Config;
using Payment.Gateway.VnPay.Request;
using Payment.Helper;
using Payment.Models;

namespace Payment.Gateway.VnPay;

public class VnPayPaymentGateway : IPaymentGateway
{
    private readonly VnpayConfig _config;

    public VnPayPaymentGateway(VnpayConfig config)
    {
        _config = config;
    }

    public Task<PaymentUrlResult> CreatePaymentUrlAsync(PaymentRequest request)
    {
        var vnpayRequest = new VnpayPayRequest()
        {
            Locale = "vn",
            IpAddr = request.IpAddress,
            Version = Constant.VERSION,
            CurrCode = Constant.CURR_CODE,
            CreateDate = DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss"),
            TmnCode = _config.TmnCode,
            Amount = request.Amount * 100,
            Command = Constant.COMMAND,
            OrderType = "100000",
            OrderInfo = TextHelper.NormalizeOrderInfo(request.OrderDescription),
            ReturnUrl = request.ReturnUrl,
            TxnRef = request.OrderId,
            ExpireDate = DateTime.UtcNow.AddHours(7).AddMinutes(15).ToString("yyyyMMddHHmmss")
        };

        try
        {
            var paymentUrl = vnpayRequest.GetLink(_config.PaymentUrl, _config.HashSecret);
            return Task.FromResult(new PaymentUrlResult
            {
                Success = true,
                PaymentUrl = paymentUrl,
                ErrorMessage = null
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new PaymentUrlResult
            {
                Success = false,
                ErrorMessage = ex.Message
            });
        }
    }

    public Task<PaymentResult> ProcessCallbackAsync(Dictionary<string, string> callbackData)
    {
        throw new NotImplementedException();
    }
}
