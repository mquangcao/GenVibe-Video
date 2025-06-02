import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import AuthProvider from './providers/authProvider';
import { ToastProvider } from './providers';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
