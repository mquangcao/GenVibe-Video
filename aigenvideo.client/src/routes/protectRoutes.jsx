import { AdminLayout } from '@/components';
import {
  BuyPage,
  CreateUserPage,
  EditUserPage,
  HomePage,
  PaymentManagerPage,
  PaymentSuccessPage,
  PlatformConnectionsPage,
  SocialVideoManagementPage,
  UserManagerPage,
} from '@/pages';
import PricingPage from '@/pages/BuyPage';
import CheckoutPage from '@/pages/CheckoutPage';

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
  {
    path: 'payment-success',
    element: <PaymentSuccessPage />,
    layout: null, // No layout for payment success page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'checkout',
    element: <CheckoutPage />,
    layout: null, // No layout for checkout page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'admin/payment-manager',
    element: <PaymentManagerPage />,
    layout: AdminLayout,
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'account/platform-connections',
    element: <PlatformConnectionsPage />,
    layout: null, // No layout for platform connections page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'social-video-management',
    element: <SocialVideoManagementPage />,
    layout: null, // No layout for social video management page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
];
