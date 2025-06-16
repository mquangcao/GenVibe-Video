using Payment.Gateway.Momo.Response;
using Payment.Helper;
using System.Text.Json;

namespace Payment.Gateway.Momo.Request;

public class MomoCollectionLinkRequest
{
    public MomoCollectionLinkRequest() { }
    public MomoCollectionLinkRequest(string partnerCode, string requestId,
            long amount, string orderId, string orderInfo, string redirectUrl,
            string ipnUrl, string requestType, string extraData, string lang = "vi")
    {
        PartnerCode = partnerCode;
        RequestId = requestId;
        Amount = amount;
        OrderId = orderId;
        OrderInfo = orderInfo;
        RedirectUrl = redirectUrl;
        IpnUrl = ipnUrl;
        RequestType = requestType;
        ExtraData = extraData;
        Lang = lang;
    }

    public async Task<(bool, string?)> GetLink(string paymentUrl, string accessKey, string secretKey)
    {
        MakeSignature(accessKey, secretKey);
        using var client = new HttpClient();
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var httpContent = new StringContent(
            JsonSerializer.Serialize(this, options),
            System.Text.Encoding.UTF8,
            "application/json"
        );

        var createPaymentLinkRes = await client.PostAsync(paymentUrl, httpContent);

        if (createPaymentLinkRes.IsSuccessStatusCode)
        {
            var responseContent = await createPaymentLinkRes.Content.ReadAsStringAsync();
            var responseData = JsonSerializer.Deserialize<MomoCollectionLinkResponse>(responseContent);
            if (responseData == null)
            {
                return (false, "Failed to deserialize response");
            }

            if (responseData.ResultCode == "0")
            {
                return (true, responseData.PayUrl);
            }
            else
            {
                return (false, responseData.Message);
            }

        }
        else
        {
            return (false, createPaymentLinkRes.ReasonPhrase);
        }
    }
    
    private void MakeSignature(string accessKey, string secretKey)
    {
        var rawHash = "accessKey=" + accessKey +
            "&amount=" + Amount +
            "&extraData=" + ExtraData +
            "&ipnUrl=" + IpnUrl +
            "&orderId=" + OrderId +
            "&orderInfo=" + OrderInfo +
            "&partnerCode=" + PartnerCode +
            "&redirectUrl=" + RedirectUrl +
            "&requestId=" + RequestId +
            "&requestType=" + RequestType;
        Signature = HashHelper.HmacSHA256(rawHash, secretKey);
    }
    public required string PartnerCode { get; set; } = "MOMO";
    public required string RequestId { get; set; } = string.Empty;
    public required long Amount { get; set; }
    public required string OrderId { get; set; } = string.Empty;
    public required string OrderInfo { get; set; } = string.Empty;
    public required string RedirectUrl { get; set; } = string.Empty;
    public required string IpnUrl { get; set; } = string.Empty;
    public required string RequestType { get; set; } = string.Empty;
    public required string ExtraData { get; set; } = string.Empty;
    public required string Lang { get; set; } = "vi";
    public required string Signature { get; set; } = string.Empty;
}
