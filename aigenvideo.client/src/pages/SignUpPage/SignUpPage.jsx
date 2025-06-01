import { signUp } from '@/apis';
import LoadingSpinner from '@/components/LoadingSpinner';
import SignupForm from '@/components/SignUpForm';
import { useAuth } from '@/hooks';
import { GalleryVerticalEnd } from 'lucide-react';
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const navigateTo = (role) => {
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

function SignUpPage() {
  const navaigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, authDispatch, role, isLoading: loadApi } = useAuth();

  if (loadApi) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return navigateTo(role);
  }

  const handleSignUp = async ({ email, password, name, confirmPassword }) => {
    setIsLoading(true);
    console.log('Sign up details:', { email, password, name, confirmPassword });
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await signUp({ email, password, name });
      if (response.data.success) {
        alert('Sign up successful! Please log in.');
        navaigate('/login');
      }
    } catch (error) {
      console.error('Sign up error:', error.response?.data?.message || error.message);
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
        <SignupForm onSubmit={handleSignUp} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default SignUpPage;
