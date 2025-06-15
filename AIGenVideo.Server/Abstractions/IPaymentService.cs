namespace AIGenVideo.Server.Abstractions;

public interface IPaymentService
{
    Task GetPlanInfoAsync(int duration);
    Task<ApiResponse<CheckOutResponse>> CheckOutAsync(int duration);
    //Task<bool> ProcessPaymentAsync(string userId, decimal amount, string paymentMethod);
    //Task<bool> RefundPaymentAsync(string userId, string transactionId);
    //Task<decimal> GetUserBalanceAsync(string userId);
    //Task<bool> AddFundsAsync(string userId, decimal amount);
    //Task<bool> DeductFundsAsync(string userId, decimal amount);
}
