namespace Payment.Abstractions;

public interface IPaymentGatewayFactory
{
    IPaymentGateway Create(string gateway);
}
