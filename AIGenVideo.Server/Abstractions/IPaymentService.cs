using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Abstractions;

public interface IPaymentService
{
    Task<Data.Entities.Payment> CreatePaymentAsync(string userId, decimal amount, string refId, string gateway, string description, string packageId, string returnUrl);
    Task<UpdatePaymentResult> UpdatePaymentStatusAsync(string orderId, string status, string? GatewayTransactionId, DateTime? paidAt = null);
    Task<bool> HandleIpnCallbackAsync(Dictionary<string, string> data);
}
