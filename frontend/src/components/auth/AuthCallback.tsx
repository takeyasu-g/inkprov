// src/components/auth/AuthCallback.tsx
// handling for Google login routing

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
          toast.success(t("toasts.signinSuccess"));
          navigate("/");
        } else {
          // No session, redirect to login
          toast.error(t("toasts.signinError"));
          navigate("/login");
        }
      } catch (error: any) {
        console.error("Error in auth callback:", error);
        toast.error(error.message || t("toasts.authError"));
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, setIsAuthenticated, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-primary-text">{t("completeLogin")}</p>
    </div>
  );
};

export default AuthCallback;
