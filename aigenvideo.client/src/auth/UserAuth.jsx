import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Nếu đang tải dữ liệu, có thể hiển thị một loading spinner hoặc gì đó
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Chưa đăng nhập → chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // Hợp lệ → render route con
  return children;
};

export default UserAuth;
