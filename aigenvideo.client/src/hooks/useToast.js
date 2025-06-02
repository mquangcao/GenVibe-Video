import { ToastContext } from '@/providers/ToastProvider';
import { useContext } from 'react';

const useToast = () => {
  const { toast } = useContext(ToastContext);

  return {
    ToastSuccess: (message) => toast.success(message),
    ToastError: (message) => toast.error(message),
    ToastInfo: (message) => toast.info(message),
    ToastWarn: (message) => toast.warn(message),
  };
};

export default useToast;
