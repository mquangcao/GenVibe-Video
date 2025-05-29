import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/LoginForm"
import { useNavigate } from "react-router-dom";
import { accountService, signIn } from "@/apis";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { actions } from "@/providers/AuthProvider";


export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const { state, dispatch } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated) {
    navigate("/admin/user");
    return;
  }
  }, []);
  
  const handleLogin = async ({ email, password }) => {
    setIsLoading(true);
    
    try 
    {
      const response = await signIn({ email, password });
      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token); 
        localStorage.setItem("refreshToken", response.data.data.refreshToken); 
        localStorage.setItem("id", response.data.data.id);
        accountService.getAccountInfo(response.data.data.id)
          .then((response) => {
            if (response.data.success) {
              dispatch({
                type: actions.LOGIN_SUCCESS,
                payload: response.data.data,
              });
            }
          })
          .catch((error) => {
            console.error("Get account info error:", error);
          });
        navigate("/admin/user");
      }

    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          AI Gen Video
        </a>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  )
}
