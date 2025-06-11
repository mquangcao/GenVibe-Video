import { AdminLayout } from '@/components';
import { BuyPage, CreateUserPage, HomePage, UserManagerPage } from '@/pages';

export const protectRoutes = [
  {
    path: 'admin',
    element: <HomePage />,
    layout: AdminLayout,
    requiredRoles: ['admin'],
  },
  {
    path: 'admin/user-manager',
    element: <UserManagerPage />,
    layout: AdminLayout,
    requiredRoles: ['admin'],
  },
  {
    path: 'admin/user-manager/create',
    element: <CreateUserPage />,
    layout: AdminLayout,
    requiredRoles: ['admin'],
  },
  {
    path: 'buy',
    element: <BuyPage />,
    layout: null, // No layout for buy page
    requiredRoles: ['user', 'user-vip', 'admin'],
  },
];
