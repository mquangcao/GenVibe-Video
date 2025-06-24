import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks';
import { resetPassword } from '@/apis';
import { useState } from 'react';

export function ChangePasswordForm({ className, email, token, ...props }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log('ChangePasswordForm rendered with email:', email);
  const navigate = useNavigate();
  const { ToastSuccess, ToastError } = useToast();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    if (password !== confirmPassword) {
      ToastError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await resetPassword({ email, newPassword: password, token: encodeURIComponent(token) });
      if (!response.data.success) {
        ToastError(response.data.message || 'Failed to update password');
        return;
      }
      ToastSuccess('Password updated successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Change password error:', error);
      ToastError('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" name="confirm-password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Update password
              </Button>
              <div className="text-center text-sm">
                Remember your password?{' '}
                <span className="underline underline-offset-4 pointer cursor-pointer" onClick={() => navigate('/login', { replace: true })}>
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
