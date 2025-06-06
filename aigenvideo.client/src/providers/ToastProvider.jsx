import React from 'react';
import { Toaster, toast } from 'sonner';

export const ToastContext = React.createContext();

function ToastProvider({ children }) {
  return (
    <ToastContext.Provider value={{ toast }}>
      <Toaster position="top-right" richColors />
      {children}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
