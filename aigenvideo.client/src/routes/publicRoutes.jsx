import { lazy } from 'react';

export const publicRoutes = [
  {
    path: '/login',
    element: lazy(() => import('@/pages/LoginPage')),
    layout: null, // No layout for login page
  },
];
