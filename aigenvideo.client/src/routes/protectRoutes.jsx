import { AdminLayout } from '@/components';
import RootLayout from '@/components/Layouts/RootLayout';
import {
  AdminDashboard,
  BuyPage,
  ContentGeneratorPage,
  CreateUserPage,
  EditorPage,
  EditUserPage,
  HomePage,
  ImageGeneratorPage,
  MyVideosPage,
  PaymentManagerPage,
  PaymentSuccessPage,
  PlatformConnectionsPage,
  SocialVideoManagementPage,
  UploadVideoPage,
  UserManagerPage,
  VoiceGeneratorPage,
} from '@/pages';
import PricingPage from '@/pages/BuyPage';
import CheckoutPage from '@/pages/CheckoutPage';

export const protectRoutes = [
  {
    path: 'admin',
    element: <AdminDashboard />,
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
    layout: RootLayout, // No layout for pricing page
    requiredRoles: ['user', 'vip'],
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
    layout: RootLayout, // No layout for platform connections page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'upload/:videoid',
    element: <SocialVideoManagementPage />,
    layout: null, // No layout for social video management page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'upload-video',
    element: <UploadVideoPage />,
    layout: null, // No layout for upload video page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'edit/:videoid',
    element: <EditorPage />,
    layout: null, // No layout for editor page
    // requiredRoles: ['user', 'vip', 'admin'],
  },
  {
    path: 'my-videos',
    element: <MyVideosPage />,
    layout: RootLayout, // No layout for my videos page
    requiredRoles: ['user', 'vip'],
  },
  {
    path: '/voice-generate',
    element: <VoiceGeneratorPage />,
    layout: RootLayout, // No layout for voice generator page
    requiredRoles: ['vip'],
  },
  {
    path: '/video-generate',
    element: <ContentGeneratorPage />,
    layout: RootLayout,
    requiredRoles: ['vip'],
  },
  {
    path: '/image-generate',
    element: <ImageGeneratorPage />,
    layout: RootLayout,
    requiredRoles: ['vip'],
  },
];
