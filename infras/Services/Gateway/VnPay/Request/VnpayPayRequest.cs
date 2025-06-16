using Payment.Gateway.VnPay.Lib;
using Payment.Helper;
using System.Net;
using System.Text;

namespace Payment.Gateway.VnPay.Request;

/// <summary>
/// href : https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
/// </summary>
public class VnpayPayRequest
{
    private readonly SortedList<string, string> requestData = new(new VnPayCompare());
    public VnpayPayRequest() { }
    public VnpayPayRequest(string version, string tmnCode, DateTime createDate, string ipAddress,
        decimal amount, string currCode, string orderType, string orderInfo,
        string returnUrl, string txnRef)
    {
        Locale = "vn";
        IpAddr = ipAddress;
        Version = version;
        CurrCode = currCode;
        CreateDate = createDate.ToString("yyyyMMddHHmmss");
        TmnCode = tmnCode;
        Amount = (int)amount * 100;
        Command = "pay";
        OrderType = orderType;
        OrderInfo = orderInfo;
        ReturnUrl = returnUrl;
        TxnRef = txnRef;
    }

    public string GetLink(string baseUrl, string secretKey)
    {
        MakeRequestData();
        StringBuilder data = new StringBuilder();
        foreach (KeyValuePair<string, string> kv in requestData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }

        string result = baseUrl + "?" + data.ToString();
        var secureHash = HashHelper.HmacSHA512(secretKey, data.ToString().Remove(data.Length - 1, 1));
        return result += "vnp_SecureHash=" + secureHash;
    }

    public void MakeRequestData()
    {
        if (Amount != null)
            requestData.Add("vnp_Amount", Amount.ToString() ?? string.Empty);
        if (Command != null)
            requestData.Add("vnp_Command", Command);
        if (CreateDate != null)
            requestData.Add("vnp_CreateDate", CreateDate);
        if (CurrCode != null)
            requestData.Add("vnp_CurrCode", CurrCode);
        if (BankCode != null)
            requestData.Add("vnp_BankCode", BankCode);
        if (IpAddr != null)
            requestData.Add("vnp_IpAddr", IpAddr);
        if (Locale != null)
            requestData.Add("vnp_Locale", Locale);
        if (OrderInfo != null)
            requestData.Add("vnp_OrderInfo", OrderInfo);
        if (OrderType != null)
            requestData.Add("vnp_OrderType", OrderType);
        if (ReturnUrl != null)
            requestData.Add("vnp_ReturnUrl", ReturnUrl);
        if (TmnCode != null)
            requestData.Add("vnp_TmnCode", TmnCode);
        if (ExpireDate != null)
            requestData.Add("vnp_ExpireDate", ExpireDate);
        if (TxnRef != null)
            requestData.Add("vnp_TxnRef", TxnRef);
        if (Version != null)
            requestData.Add("vnp_Version", Version);
    }
    public required decimal? Amount { get; set; }
    public required string? Command { get; set; }
    public required string? CreateDate { get; set; }
    public required string? CurrCode { get; set; }
    public required string? BankCode { get; set; }
    public required string? IpAddr { get; set; }
    public required string? Locale { get; set; }
    public required string? OrderInfo { get; set; }
    public required string? OrderType { get; set; }
    public required string? ReturnUrl { get; set; }
    public required string? TmnCode { get; set; }
    public required string? ExpireDate { get; set; }
    public required string? TxnRef { get; set; }
    public required string? Version { get; set; }
    public required string? SecureHash { get; set; }
}