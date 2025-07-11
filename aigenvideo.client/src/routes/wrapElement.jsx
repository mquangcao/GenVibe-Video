import { AdminAuth, UserAuth, UserVipAuth } from '@/auth';
import { MainLayout } from '@/components/Layouts';

const wrapElement = (routes) => {
  return routes.map((route) => {
    const { layout: Layout, element: Component, requiredRoles, ...rest } = route;
    const elementLayout = Layout ? <Layout>{Component}</Layout> : Layout === null ? Component : <MainLayout>{Component}</MainLayout>;

    const ProtectedRoute = mapAuth(requiredRoles);

    const wrappedElement = <ProtectedRoute requiredRoles={requiredRoles}>{elementLayout}</ProtectedRoute>;
    return {
      ...rest,
      element: wrappedElement,
    };
  });
};

export { wrapElement };

const mapAuth = (requiredRoles) => {
  if (requiredRoles && requiredRoles.includes('admin')) {
    return AdminAuth;
  }
  if (requiredRoles && requiredRoles.includes('vip')) {
    return UserVipAuth;
  }
  if (requiredRoles && requiredRoles.includes('user')) {
    return UserAuth;
  }
  return ({ children }) => children; // No auth required
};
