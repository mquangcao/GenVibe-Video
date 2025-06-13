import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, CreditCard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  // Giả lập lấy thông tin từ URL parameters
  // Trong thực tế, bạn có thể sử dụng URLSearchParams hoặc thư viện query-string
  const planType = 'monthly'; // Có thể là "monthly" hoặc "yearly"
  const paymentMethod = 'momo'; // Có thể là "momo" hoặc "vnpay"

  // Plan details based on selection
  const planDetails = {
    monthly: {
      name: 'VIP Monthly',
      price: '50.000',
      period: 'month',
      duration: '1 month',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    yearly: {
      name: 'VIP Yearly',
      price: '500.000',
      period: 'year',
      duration: '1 year',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  };

  const plan = planDetails[planType];

  // Auto-redirect after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
          <div className="mx-auto mb-4 bg-white/20 p-3 rounded-full inline-flex">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your VIP subscription is now active</p>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-1.5 rounded-full">
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">VIP Status Activated</h3>
                <p className="text-sm text-green-700">All premium features are now unlocked</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Expiry date</span>
                </div>
                <span className="font-medium text-sm">{plan.expiryDate}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Amount paid</span>
                </div>
                <span className="font-medium text-sm">{plan.price}đ</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 6L7 11H10V18H14V11H17L12 6Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Payment method</span>
                </div>
                <span className="font-medium text-sm capitalize">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">A receipt has been sent to your email address. Thank you for your purchase!</p>

            <Button
              onClick={() => (window.location.href = '/')}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              Continue to Dashboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-4 w-4"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Redirecting automatically</span>
                <span>{countdown}s</span>
              </div>
              <Progress value={(countdown / 5) * 100} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
