import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks'; // giả sử bạn có hook này

const UserAuth = ({ children, requiredRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    // Chưa đăng nhập → chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // Hợp lệ → render route con
  return children;
};

export default UserAuth;
