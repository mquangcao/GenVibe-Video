using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Services;


public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Data.Entities.Payment> CreatePaymentAsync(string userId, decimal amount, string refId, string gateway, string description, string packageId, string returnUrl)
    {
        ArgumentException.ThrowIfNullOrEmpty(userId, nameof(userId));
        ArgumentException.ThrowIfNullOrEmpty(refId, nameof(refId));
        ArgumentException.ThrowIfNullOrEmpty(gateway, nameof(gateway));
        ArgumentException.ThrowIfNullOrEmpty(returnUrl, nameof(returnUrl));
        try
        {
            var payment = new Data.Entities.Payment()
            {
                PaymentId = Guid.NewGuid().ToString(),
                UserId = userId,
                RefId = refId,
                Amount = amount,
                Gateway = gateway,
                Description = description,
                Status = PaymentStatus.PENDING,
                Currency = Constants.CURRENCY_VND,
                CreatedAt = DateTime.UtcNow,
                PaidAt = null, // Not paid yet
                ExpireAt = DateTime.UtcNow.AddMinutes(15),
                PackageId = packageId,
                ReturnUrl = returnUrl
            };
            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();
            return payment;
        }
        catch (Exception ex)
        {
            // Log the exception (not implemented here)
            throw new Exception("An error occurred while creating the payment.", ex);
        }
    }

    public Task<bool> HandleIpnCallbackAsync(Dictionary<string, string> data)
    {
        throw new NotImplementedException();
    }

    public async Task<UpdatePaymentResult> UpdatePaymentStatusAsync(string orderId, string status, string? GatewayTransactionId, DateTime? paidAt = null)
    {
        try
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.RefId == orderId) ?? throw new Exception("Payment not found.");
            payment.Status = status;
            payment.GatewayTransactionId = GatewayTransactionId;
            payment.PaidAt = paidAt ?? DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return new UpdatePaymentResult()
            {
                IsSuccess = true,
                Message = "Payment status updated successfully.",
                PackageId = payment.PackageId,
                ReturnUrl = payment.ReturnUrl,
                UserId = payment.UserId
            };
        }
        catch (Exception ex)
        {
            return new UpdatePaymentResult()
            {
                IsSuccess = false,
                Message = ex.Message,
                PackageId = null,
                ReturnUrl = null
            };
        }
    }

}
