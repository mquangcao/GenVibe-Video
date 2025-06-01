import { AuthContext } from '@/providers/AuthProvider';
import { useContext } from 'react';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth');
  }

  return {
    authState: context.authState,
    authDispatch: context.authDispatch,
    user: context.authState.user,
    isAuthenticated: context.authState.isAuthenticated,
    role: context.authState.user?.role || null,
    isLoading: context.authState.isLoading,
  };
};

export default useAuth;
