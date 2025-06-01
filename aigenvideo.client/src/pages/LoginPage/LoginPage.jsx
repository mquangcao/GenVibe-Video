import { GalleryVerticalEnd } from 'lucide-react';
import { LoginForm } from '@/components/LoginForm';
import { accountService, signIn } from '@/apis';
import { useAuth } from '@/hooks';
import { login } from '@/redux';
import { useState } from 'react';
import { saveAuthTokens } from '@/utils';
import { Navigate, useNavigate } from 'react-router-dom';

const navigateTo = (role) => {
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, authDispatch, role } = useAuth();
  const navigate = useNavigate();
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

        navigateTo(responseProfile.data.data.role, navigate);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          AI Gen Video
        </a>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}
