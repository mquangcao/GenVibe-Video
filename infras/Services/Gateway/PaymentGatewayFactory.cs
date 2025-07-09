using Payment.Abstractions;

namespace Payment.Gateway;

public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly Dictionary<string, Type> _gatewayTypes;

    public PaymentGatewayFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;

        _gatewayTypes = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
        {
            { "vnpay", typeof(VnPay.VnPayPaymentGateway) },
            { "momo", typeof(Momo.MomoPaymentGateway) }
        };
    }
    public IPaymentGateway Create(string gateway)
    {
        if (!_gatewayTypes.TryGetValue(gateway, out var gatewayType))
        {
            throw new NotSupportedException($"Payment gateway '{gateway}' is not supported.");
        }

        var instance = _serviceProvider.GetService(gatewayType);
        return instance as IPaymentGateway
            ?? throw new InvalidOperationException($"Service for gateway '{gateway}' is not registered correctly.");
    }
}
