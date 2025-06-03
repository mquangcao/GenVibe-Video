import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks';
import { useState } from 'react';
import { forgotPassword } from '@/apis';

export function ForgotPasswordForm({ className, ...props }) {
  const navigate = useNavigate();
  const { ToastSuccess, ToastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const email = formData.get('email');

      const callbackUrl = `${import.meta.env.VITE_SERVER_PROXY}/change-password`;
      const response = await forgotPassword({ email, callbackUrl });
      if (!response.data.success) {
        ToastError(response.data.message || 'Failed to send reset link');
        return;
      }
      ToastSuccess(`Reset link sent to ${email}`);
      navigate('/login', { replace: true });
    } catch (error) {
      ToastError('Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Send reset link
              </Button>
              <div className="text-center text-sm">
                Remember your password?{' '}
                <span
                  className="underline underline-offset-4  pointer cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login', { replace: true });
                  }}
                >
                  Back to login
                </span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
