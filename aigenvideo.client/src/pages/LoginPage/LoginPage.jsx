import { GalleryVerticalEnd } from 'lucide-react';
import { LoginForm } from '@/components/LoginForm';
import { accountService, loginWithGoogle, signIn } from '@/apis';
import { useAuth, useToast } from '@/hooks';
import { login } from '@/redux';
import { useState } from 'react';
import { saveAuthTokens } from '@/utils';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

const navigateTo = (role) => {
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, authDispatch, role, isLoading: loadApi } = useAuth();
  const { ToastSuccess, ToastError } = useToast();

  if (loadApi) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return navigateTo(role);
  }

  const handleLogin = async ({ email, password }) => {
    setIsLoading(true);

    try {
      const response = await signIn({ email, password });
      if (response.data.success) {
        saveAuthTokens(response.data.data);

        const responseProfile = await accountService.getAccountProfile();
        authDispatch(login(responseProfile.data.data));
        ToastSuccess('Login successful!');
        navigateTo(responseProfile.data.data.role);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data) {
        ToastError(error.response.data.message || 'Login failed');
      } else {
        ToastError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginGoogle = async (codeResponse) => {
    setIsLoading(true);
    console.log('quang check Google login code response:', codeResponse);
    try {
      const response = await loginWithGoogle(codeResponse);
      saveAuthTokens(response.data.data);

      const responseProfile = await accountService.getAccountProfile();
      authDispatch(login(responseProfile.data.data));
      ToastSuccess('Login successful!');
      navigateTo(responseProfile.data.data.role);
    } catch (error) {
      console.error('Google login error:', error);
      if (error.response && error.response.data) {
        ToastError(error.response.data.message || 'Google login failed');
      } else {
        ToastError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          AI Gen Video
        </span>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} handleLoginGoogle={handleLoginGoogle} />
      </div>
    </div>
  );
}
