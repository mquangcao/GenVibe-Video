import { LoginPage, SignUpPage } from '@/pages';

// Các route ai cũng truy cập được, không cần đăng nhập.
export const publicRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
    layout: null, // No layout for login page
  },
  {
    path: '/signup',
    element: <SignUpPage />,
    layout: null, // No layout for signup page
  },
];
