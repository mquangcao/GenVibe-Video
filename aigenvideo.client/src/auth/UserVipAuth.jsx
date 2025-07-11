import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserVipAuth = ({ children, requiredRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    // Nếu đang tải dữ liệu, có thể hiển thị một loading spinner hoặc gì đó
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Chưa đăng nhập → chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role
  if (requiredRoles && !requiredRoles.includes(role)) {
    // Không phải user hoặc vip → chuyển về trang Forbidden hoặc Not Found
    return <Navigate to="/pricing" replace />;
  }

  // Hợp lệ → render route con
  return children;
};

export default UserVipAuth;
