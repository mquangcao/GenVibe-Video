using Microsoft.Extensions.Options;
using Payment.Abstractions;
using Payment.Gateway.VnPay.Common;
using Payment.Gateway.VnPay.Config;
using Payment.Gateway.VnPay.Request;
using Payment.Gateway.VnPay.Response;
using Payment.Helper;
using Payment.Models;
using System.Text.Json;

namespace Payment.Gateway.VnPay;

public class VnPayPaymentGateway : IPaymentGateway
{
    private readonly VnpayConfig _config;

    public VnPayPaymentGateway(IOptions<VnpayConfig> config)
    {
        _config = config.Value;
    }

    public Task<PaymentUrlResult> CreatePaymentUrlAsync(PaymentRequest request)
    {
        var vnpayRequest = new VnpayPayRequest()
        {
            Locale = Constant.VN_LOCALE,
            IpAddr = request.IpAddress,
            Version = Constant.VERSION,
            CurrCode = Constant.CURR_CODE,
            CreateDate = DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss"),
            TmnCode = _config.TmnCode,
            Amount = request.Amount * 100,
            Command = Constant.COMMAND,
            OrderType = "100000",
            OrderInfo = TextHelper.NormalizeOrderInfo(request.OrderDescription),
            ReturnUrl = !string.IsNullOrEmpty(request.ReturnUrl) ? (request.ReturnUrl) : _config.ReturnUrl,
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
        var response = JsonSerializer.Deserialize<VnPayResponse>(JsonSerializer.Serialize(callbackData));
        var isValid = response?.IsValidSignature(_config.HashSecret);
        if (isValid == false || response == null)
        {
            return Task.FromResult(new PaymentResult
            {
                Success = false,
                Message = "Invalid signature"
            });
        }

        if (response.vnp_ResponseCode != "00")
        {
            return Task.FromResult(new PaymentResult
            {
                Success = false,
                Message = $"Payment failed with response code: {response.vnp_ResponseCode}"
            });
        }
        decimal actualAmount = 0m;
        if (int.TryParse(response.vnp_Amount, out var intAmount))
        {
            actualAmount = intAmount / 100m;
        }

        return Task.FromResult(new PaymentResult()
        {
            Success = true,
            OrderId = response.vnp_TxnRef,
            Amount = actualAmount,
            Message = "Payment successful",
            TransactionId = response.vnp_TransactionNo,
            Gateway = "vnpay",
            PaidAt = DateTime.UtcNow
        });
    }
}
