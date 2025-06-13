import { AdminLayout } from '@/components';
import { BuyPage, CreateUserPage, EditUserPage, HomePage, UserManagerPage } from '@/pages';
import PricingPage from '@/pages/BuyPage';

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
    path: 'admin/user-manager/:id',
    element: <EditUserPage />,
    layout: AdminLayout,
    requiredRoles: ['admin'],
  },
  {
    path: 'pricing',
    element: <PricingPage />,
    layout: null, // No layout for pricing page
    requiredRoles: ['user', 'vip', 'admin'],
  },
];
