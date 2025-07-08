namespace Payment.Models;

public class PaymentResult
{
    public bool Success { get; set; }  
    public string OrderId { get; set; } = string.Empty;    
    public decimal Amount { get; set; }              
    public string Message { get; set; } = string.Empty;        
    public string TransactionId { get; set; } = string.Empty;  
    public string Gateway { get; set; } = string.Empty;        
    public DateTime? PaidAt { get; set; }         
    public Dictionary<string, string> RawData { get; set; } = new(); 
}

