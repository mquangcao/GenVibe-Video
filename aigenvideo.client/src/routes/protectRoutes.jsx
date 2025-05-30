import { AdminLayout } from '@/components';
import { lazy } from 'react';

export const protectRoutes = [
  {
    path: 'admin/user',
    element: lazy(() => import('@/pages/Admin/UserManagerPage')),
    layout: AdminLayout,
  },
];
