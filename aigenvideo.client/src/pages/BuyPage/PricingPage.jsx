import { Check, ChevronRight, Crown, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    originalPrice: null,
    icon: null,
    badge: null,
    buttonText: 'Free Plan',
    buttonVariant: 'secondary',
    buttonIcon: ChevronRight,
    popular: false,
    features: ['Basic features', 'Daily usage limits', 'Community support', 'Standard quality'],
  },
  {
    name: 'VIP Monthly',
    price: '50.000',
    period: '/ month',
    originalPrice: null,
    icon: Crown,
    badge: null,
    buttonText: 'Buy 1 Month',
    buttonVariant: 'default',
    buttonIcon: null,
    popular: false,
    features: [
      'Unlimited usage',
      'Premium quality',
      'Priority processing',
      '24/7 support',
      'No watermarks',
      'Early access to new features',
      'Advanced customization',
      'API access',
    ],
  },
  {
    name: 'VIP Yearly',
    price: '500.000',
    period: '/ year',
    originalPrice: '600.000',
    icon: Calendar,
    badge: 'Save 17%',
    buttonText: 'Buy 1 Year',
    buttonVariant: 'default',
    buttonIcon: null,
    popular: true,
    features: [
      'Unlimited usage',
      'Premium quality',
      'Priority processing',
      '24/7 support',
      'No watermarks',
      'Early access to new features',
      'Advanced customization',
      'API access',
      'Save 100.000đ per year',
    ],
  },
];

const userStatus = {
  isVIP: true,
  daysRemaining: 1,
  totalDays: 30,
  expiryDate: 'July 1, 2025',
};

export default function PricingPage() {
  const percentRemaining = (userStatus.daysRemaining / userStatus.totalDays) * 100;
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {userStatus.isVIP ? (
                <>
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">VIP Status: Active</h2>
                    <p className="text-gray-600">You're enjoying all VIP benefits</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Crown className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">VIP Status: Inactive</h2>
                    <p className="text-gray-600">Upgrade to enjoy premium features</p>
                  </div>
                </>
              )}
            </div>

            {userStatus.isVIP && (
              <div className="flex flex-col w-full md:w-auto md:min-w-[300px]">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {userStatus.daysRemaining} days remaining
                  </span>
                  <span className="text-sm font-medium text-gray-700">Expires: {userStatus.expiryDate}</span>
                </div>
                <Progress value={percentRemaining} className="h-2" />
              </div>
            )}
          </div>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Upgrade your account to unlock all features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col h-auto w-full ${
                plan.popular
                  ? 'border-blue-500 shadow-xl'
                  : plan.name === 'Free'
                  ? 'border-gray-200'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700">{plan.badge}</Badge>
              )}

              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {plan.icon && <plan.icon className="w-6 h-6 text-blue-600" />}
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}đ</span>
                    <span className="text-gray-500 text-lg">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-2 -mb-8">
                      <span className="text-gray-400 line-through text-lg">{plan.originalPrice}đ</span>
                      <span className="text-green-600 font-medium ml-2">Save 100.000đ</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex-grow px-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6 mt-auto px-6 pb-6">
                <Button
                  className={`w-full py-2 px-4 text-base font-medium ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.name === 'Free'
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  variant={plan.buttonVariant}
                  disabled={plan.name === 'Free'}
                >
                  {plan.buttonText}
                  {plan.buttonIcon && <plan.buttonIcon className="w-4 h-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need help?{' '}
            <Link to="/support" className="text-blue-600 hover:underline font-medium">
              Contact us
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border">
            <Check className="w-4 h-4 text-green-500" />
            Cancel anytime • No long-term commitment • Secure payments
          </div>
        </div>
      </div>
    </div>
  );
}
