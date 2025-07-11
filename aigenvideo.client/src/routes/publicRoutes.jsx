import { ForgotPasswordPage, LoginPage, SignUpPage, VoiceGeneratorPage, ContentGeneratorPage, ImageGeneratorPage } from '@/pages';
import ChangePasswordPage from '@/pages/ChangePasswordPage';

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
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    layout: null, // No layout for forgot password page
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />,
    layout: null, // No layout for change password page
  },
];
