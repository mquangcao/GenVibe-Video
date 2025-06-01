import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks'; // giả sử bạn có hook này

const AdminAuth = ({ children, requiredRoles }) => {
  const { isAuthenticated, role } = useAuth();
  console.log('AdminAuth', { isAuthenticated, role });

  if (!isAuthenticated) {
    // Chưa đăng nhập → chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role
  if (requiredRoles && !requiredRoles.includes(role)) {
    // Không phải admin → chuyển về trang Forbidden hoặc Not Found
    return <Navigate to="/forbidden" replace />;
  }

  // Hợp lệ → render route con
  return children;
};

export default AdminAuth;
