'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, RefreshCw } from 'lucide-react';
import { GatewayCell } from './GatewayCell';

export function PaymentInfoModal({ payment, isOpen, onClose }) {
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckResult, setRecheckResult] = useState(null);

  const handleRecheck = async () => {
    setIsRechecking(true);
    setRecheckResult(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response
      const mockResult = {
        success: true,
        message: 'Transaction verified successfully',
        updated: Math.random() > 0.5, // Random update status
      };

      setRecheckResult(mockResult);
    } catch (error) {
      setRecheckResult({
        success: false,
        message: 'Failed to verify transaction',
      });
    } finally {
      setIsRechecking(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Payment Information
          </DialogTitle>
          <DialogDescription>Detailed information about the selected payment transaction</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Payment ID</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-sm break-all">{payment.id}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">{payment.email}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Package Name</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-orange-600 font-medium">{payment.name}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border font-semibold">{payment.amount}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Gateway</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <GatewayCell gateway={payment.gateway} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border flex items-center justify-center">
                  <Badge
                    variant="secondary"
                    className={
                      payment.status === 'pending'
                        ? 'bg-yellow-400 text-white'
                        : payment.status === 'success'
                        ? 'bg-green-400 text-white '
                        : 'bg-gray-500 text-white'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">{payment.createdAt}</div>
              </div>
            </div>
          </div>

          {recheckResult && (
            <div
              className={`p-3 rounded border ${
                recheckResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {recheckResult.success ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                <span className="font-medium">{recheckResult.success ? 'Verification Successful' : 'Verification Failed'}</span>
              </div>
              <p className="mt-1 text-sm">{recheckResult.message}</p>
              {recheckResult.updated && <p className="mt-1 text-sm font-medium">✅ Payment information has been updated</p>}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleRecheck}
            disabled={isRechecking}
            className="flex items-center gap-2 !border-gray-300 !border"
          >
            <RefreshCw className={`w-4 h-4 ${isRechecking ? 'animate-spin' : ''}`} />
            {isRechecking ? 'Rechecking...' : 'Recheck'}
          </Button>

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
