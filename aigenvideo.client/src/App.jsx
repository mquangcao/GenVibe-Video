import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes"
import AuthProvider from "./providers/authProvider";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App