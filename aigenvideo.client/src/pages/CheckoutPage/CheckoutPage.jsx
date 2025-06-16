import React, { useEffect } from 'react';
import { useState } from 'react';
import { CreditCard, Calendar, CheckCircle, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CustomRadioGroup, CustomRadioItem } from '@/components/ui/radio-button-fix';
import { Icons } from '@/common';
import { checkout, payment } from '@/apis/paymentService';
import { th } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [planData, setPlanData] = useState({});

  useEffect(() => {
    const { duration } = JSON.parse(localStorage.getItem('payment_plan')) || {};
    if (!duration) {
      navigate('/not-found');
      return;
    }
    const fetchPlan = async () => {
      try {
        const response = await checkout(duration);
        console.log(response.data.data);
        if (response.data.success) {
          setPlanData({
            ...response.data.data,
            price: response.data.data.price.toLocaleString('vi-VN'),
            originalPrice: response.data.data.originalPrice.toLocaleString('vi-VN'),
            savings: response.data.data.savings.toLocaleString('vi-VN'),
            nextBillingDate: new Date(response.data.data.nextBillingDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          });
        } else {
          console.error('Failed to fetch plan data:', response.data.message);
          navigate('/not-found'); // hoặc set error
        }
      } catch (error) {
        console.error('Error fetching plan data:', error);
        navigate('/not-found'); // hoặc set error
      }
    };
    fetchPlan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      email,
      provider: paymentMethod,
      duration: planData.durationMonths,
      returnUrl: `${window.location.origin}/payment-success`,
    };

    localStorage.removeItem('payment_plan');

    try {
      const response = await payment(data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment failed');
      }
      console.log('Payment successful:', response.data.data);
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center">
          <button
            onClick={goBack}
            className="group flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Plans
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600 max-w-md mx-auto">You're just one step away from unlocking all VIP features and benefits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Order Summary */}
          <div className="lg:col-span-5">
            <Card className="overflow-hidden border-1 shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <h2 className="text-xl font-bold mb-1">Order Summary</h2>
                <p className="text-blue-100 text-sm">Review your subscription details</p>
              </div>

              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <p className="font-semibold text-lg text-gray-900">{planData.name}</p>
                      <p className="text-gray-500 text-sm">{planData.duration} subscription</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-gray-900">{planData.price}đ</p>
                      <p className="text-gray-500 text-xs">{planData.planType === 'monthly' ? 'Billed monthly' : 'Billed annually'}</p>
                    </div>
                  </div>

                  {planData.planType === 'yearly' && (
                    <div className="bg-green-50 rounded-lg p-3 flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-800 font-medium text-sm">You save {planData.savings}đ</p>
                        <p className="text-green-700 text-xs">That's 17% off compared to the monthly plan for a full year</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Next billing date:</span> {planData.nextBillingDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Access period:</span> Immediate after payment
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Cancel anytime:</span> No long-term commitment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">Total</p>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-900">{planData.price}đ</p>
                        {planData.planType === 'yearly' && <p className="text-gray-500 line-through text-sm">{planData.originalPrice}đ</p>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" /> VIP Benefits Included
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                        Unlimited usage
                      </li>
                      <li className="flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                        Premium quality
                      </li>
                      <li className="flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                        Priority support 24/7
                      </li>
                      <li className="flex items-center">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                        No watermarks
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-7">
            <Card className="border-1 shadow-lg">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                  Payment Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium mb-3">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll send your receipt and confirmation to this email</p>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium mb-3 block">Payment method</Label>
                    <CustomRadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div
                        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-all ${
                          paymentMethod === 'momo' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('momo')}
                      >
                        <div className="flex items-center gap-4">
                          <CustomRadioItem
                            value="momo"
                            id="momo"
                            checked={paymentMethod === 'momo'}
                            onChange={setPaymentMethod}
                            className="flex items-center"
                          ></CustomRadioItem>
                          <div className="bg-purple-100 rounded-lg p-2 flex items-center justify-center w-12 h-12">
                            <Icons.Momo />
                          </div>
                          <div>
                            <Label htmlFor="momo" className="cursor-pointer font-medium text-gray-900 ">
                              MoMo
                            </Label>
                            <p className="text-sm text-gray-500">Fast and secure e-wallet payment</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">Recommended</div>
                      </div>

                      <div
                        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-all ${
                          paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('vnpay')}
                      >
                        <div className="flex items-center gap-4">
                          <CustomRadioItem
                            value="vnpay"
                            id="vnpay"
                            checked={paymentMethod === 'vnpay'}
                            onChange={setPaymentMethod}
                            className="flex items-center"
                          ></CustomRadioItem>
                          <div className="bg-blue-100 rounded-lg p-2 flex items-center justify-center w-12 h-12">
                            <Icons.VnPay />
                          </div>
                          <div>
                            <Label htmlFor="vnpay" className="cursor-pointer font-medium text-gray-900">
                              VN Pay
                            </Label>
                            <p className="text-sm text-gray-500">Pay with bank transfer or credit card</p>
                          </div>
                        </div>
                      </div>
                    </CustomRadioGroup>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className={`w-full h-14 text-base font-medium rounded-lg transition-all ${
                        paymentMethod === 'momo'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">Complete Payment • {planData.price}đ</span>
                      )}
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      <span>Secure payment processing</span>
                      <span>•</span>
                      <span>Cancel anytime</span>
                      <span>•</span>
                      <span>Instant access</span>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
