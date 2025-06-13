'use client';

import React from 'react';

import { useState } from 'react';
import { Label } from '@/components/ui/label';

// Phiên bản tùy chỉnh của RadioGroup và RadioGroupItem
export function CustomRadioGroup({ value, onValueChange, children, className }) {
  return <div className={`space-y-3 ${className || ''}`}>{children}</div>;
}

export function CustomRadioItem({ value, id, checked, onChange, children, className }) {
  return (
    <div className={className}>
      <div className="flex items-center">
        <input
          type="radio"
          id={id}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        {children}
      </div>
    </div>
  );
}

// Ví dụ sử dụng
export default function PaymentMethodSelector() {
  const [paymentMethod, setPaymentMethod] = useState < string > 'momo';

  return (
    <div className="p-6 border rounded-lg shadow-sm">
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
            >
              <Label htmlFor="momo" className="cursor-pointer font-medium text-gray-900 ml-2">
                MoMo
              </Label>
            </CustomRadioItem>
            <div className="bg-purple-100 rounded-lg p-2 flex items-center justify-center w-12 h-12">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.2" />
                <path
                  d="M12 6L7 11H10V18H14V11H17L12 6Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
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
            >
              <Label htmlFor="vnpay" className="cursor-pointer font-medium text-gray-900 ml-2">
                VN Pay
              </Label>
            </CustomRadioItem>
            <div className="bg-blue-100 rounded-lg p-2 flex items-center justify-center w-12 h-12">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.2" />
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pay with bank transfer or credit card</p>
            </div>
          </div>
        </div>
      </CustomRadioGroup>
    </div>
  );
}
