import RootLayout from '@/components/Layouts/RootLayout';
import { ForbiddenPage, HomePage, NotFoundPage } from '@/pages';
// các route chung cho toàn bộ ứng dụng, không cần phân quyền
export const commonRoutes = [
  {
    path: '/',
    element: <HomePage />,
    layout: RootLayout,
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
