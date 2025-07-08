using Payment.Gateway.VnPay.Lib;
using Payment.Helper;
using System.Net;
using System.Text;

namespace Payment.Gateway.VnPay.Response;

public class VnPayResponse
{
    private readonly SortedList<string, string> _responseData = new SortedList<string, string>(new VnPayCompare());
    
    public bool IsValidSignature(string secretKey)
    {
        MakeResponseData();
        var data = new StringBuilder();
        foreach (KeyValuePair<string, string> kv in _responseData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        string checkSum = HashHelper.HmacSHA512(secretKey,
            data.ToString().Remove(data.Length - 1, 1));
        return checkSum.Equals(vnp_SecureHash, StringComparison.InvariantCultureIgnoreCase);
    }

    public void MakeResponseData()
    {
        if (vnp_Amount != null)
            _responseData.Add("vnp_Amount", vnp_Amount.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_TmnCode))
            _responseData.Add("vnp_TmnCode", vnp_TmnCode.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_BankCode))
            _responseData.Add("vnp_BankCode", vnp_BankCode.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_BankTranNo))
            _responseData.Add("vnp_BankTranNo", vnp_BankTranNo.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_CardType))
            _responseData.Add("vnp_CardType", vnp_CardType.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_OrderInfo))
            _responseData.Add("vnp_OrderInfo", vnp_OrderInfo.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_TransactionNo))
            _responseData.Add("vnp_TransactionNo", vnp_TransactionNo.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_TransactionStatus))
            _responseData.Add("vnp_TransactionStatus", vnp_TransactionStatus.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_TxnRef))
            _responseData.Add("vnp_TxnRef", vnp_TxnRef.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_PayDate))
            _responseData.Add("vnp_PayDate", vnp_PayDate.ToString() ?? string.Empty);
        if (!string.IsNullOrEmpty(vnp_ResponseCode))
            _responseData.Add("vnp_ResponseCode", vnp_ResponseCode ?? string.Empty);
    }

    public string vnp_TmnCode { get; set; } = string.Empty;
    public string vnp_BankCode { get; set; } = string.Empty;
    public string vnp_BankTranNo { get; set; } = string.Empty;
    public string vnp_CardType { get; set; } = string.Empty;
    public string vnp_OrderInfo { get; set; } = string.Empty;
    public string vnp_TransactionNo { get; set; } = string.Empty;
    public string vnp_TransactionStatus { get; set; } = string.Empty;
    public string vnp_TxnRef { get; set; } = string.Empty;
    public string vnp_SecureHashType { get; set; } = string.Empty;
    public string vnp_SecureHash { get; set; } = string.Empty;
    public string vnp_Amount { get; set; } = string.Empty;
    public string? vnp_ResponseCode { get; set; }
    public string vnp_PayDate { get; set; } = string.Empty;
}
