import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks'; // giả sử bạn có hook này

const UserVipAuth = ({ children, requiredRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    // Chưa đăng nhập → chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role
  if (requiredRoles && !requiredRoles.includes(role)) {
    // Không phải user hoặc vip → chuyển về trang Forbidden hoặc Not Found
    return <Navigate to="/buy" replace />;
  }

  // Hợp lệ → render route con
  return children;
};

export default UserVipAuth;
