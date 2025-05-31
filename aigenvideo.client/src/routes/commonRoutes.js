import { lazy } from 'react';

export const commonRoutes = [
  {
    path: '/',
    element: lazy(() => import('@/pages/HomePage')),
  },
  {
    path: '*',
    element: lazy(() => import('@/pages/NotFoundPage')),
  },
];
