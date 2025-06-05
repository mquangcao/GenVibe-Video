import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import AuthProvider from './providers/authProvider';
import { ToastProvider } from './providers';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  console.log('Google Client ID:', import.meta.env);
  return (
    <AuthProvider>
      <ToastProvider>
        <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
