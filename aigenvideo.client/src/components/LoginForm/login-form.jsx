import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '@/apis';
import { useToast } from '@/hooks';
import { saveAuthTokens } from '@/utils';

export default function LoginForm({
  className,
  isLoading,
  onSubmit, // Callback function to handle form submission
  handleLoginGoogle,
  ...props
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { ToastSuccess, ToastError } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit({ email, password });
    }
  };

  console.log(window.location.origin);
  const login = useGoogleLogin({
    prompt: 'consent',
    scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: async (codeResponse) => {
      if (!codeResponse || !codeResponse.code) {
        ToastError('Google login failed. Please try again.');
        return;
      }

      if (handleLoginGoogle) {
        handleLoginGoogle(codeResponse.code);
        return;
      }
      ToastError('Google login failed. Please try again.');
    },
    onError: (error) => console.error('Login Failed:', error),
    flow: 'auth-code',
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4 border border-black-500 rounded-md">
            <Button variant="outline" className="w-full" onClick={() => login()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Login with Google
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <span
                      className="ml-auto text-sm underline-offset-4 hover:underline  pointer cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/forgot-password');
                      }}
                    >
                      Forgot your password?
                    </span>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <span
                  className="underline underline-offset-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup');
                  }}
                >
                  Sign up
                </span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
