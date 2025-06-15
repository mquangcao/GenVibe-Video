

namespace AIGenVideo.Server.Services;

public class PaymentService : IPaymentService
{
    public Task<ApiResponse<CheckOutResponse>> CheckOutAsync(int duration)
    {
        throw new NotImplementedException();
    }

    //private readonly Dictionary<int>
    public Task GetPlanInfoAsync(int duration)
    {
        throw new NotImplementedException();
    }
}
