import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

export const ToastContext = React.createContext();

function ToastProvider({ children }) {
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer autoClose={1000} hideProgressBar />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
