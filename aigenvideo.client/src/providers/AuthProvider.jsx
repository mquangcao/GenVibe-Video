import { accountService } from '@/apis';
import { authReducer, authInitState, login, logout } from '@/redux';
import React, { useEffect, useReducer, createContext } from 'react';

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [authState, authDispatch] = useReducer(authReducer, authInitState);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await accountService.getAccountProfile();
        if (response.data.success) {
          authDispatch(login(response.data.data));
        }
      } catch (error) {
        authDispatch(logout());
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, [authDispatch]);

  return <AuthContext.Provider value={{ authState, authDispatch }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
