import { accountService } from '@/apis';
import React, { useEffect, useReducer, createContext } from 'react';

export const AuthContext = createContext();

export const actions = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
};

const initState = {
  user: null,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case actions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case actions.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initState);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (id) {
      // Gọi API ở đây, KHÔNG phải trong reducer
      accountService.getAccountInfo(id)
        .then((response) => {
          if (response.data.success) {
            dispatch({
              type: actions.LOGIN_SUCCESS,
              payload: response.data.data,
            });
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
