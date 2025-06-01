import { LoginPage } from '@/pages';

// Các route ai cũng truy cập được, không cần đăng nhập.
export const publicRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
    layout: null, // No layout for login page
  },
];
