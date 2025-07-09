import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Building2 } from 'lucide-react';

export function GatewayCell({ gateway }) {
  const getGatewayConfig = (gateway) => {
    switch (gateway.toLowerCase()) {
      case 'vnpay':
        return {
          label: 'VNPay',
          variant: 'default',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          icon: <CreditCard className="w-3 h-3 mr-1" />,
        };
      case 'momo':
        return {
          label: 'MoMo',
          variant: 'secondary',
          className: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
          icon: <Wallet className="w-3 h-3 mr-1" />,
        };
      case 'zalopay':
        return {
          label: 'ZaloPay',
          variant: 'outline',
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          icon: <Wallet className="w-3 h-3 mr-1" />,
        };
      case 'banking':
        return {
          label: 'Banking',
          variant: 'secondary',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          icon: <Building2 className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          label: gateway,
          variant: 'outline',
          className: 'bg-gray-100 text-gray-600',
          icon: <CreditCard className="w-3 h-3 mr-1" />,
        };
    }
  };

  const config = getGatewayConfig(gateway);

  return (
    <div className="flex justify-center">
      <Badge variant={config.variant} className={`${config.className} font-medium`}>
        {config.icon}
        {config.label}
      </Badge>
    </div>
  );
}
