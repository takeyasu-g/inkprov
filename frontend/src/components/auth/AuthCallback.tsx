// src/components/auth/AuthCallback.tsx
// handling for Google login routing

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AuthCallback = () => {
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
          toast.success("Successfully logged in!");
          navigate("/sessions");
        } else {
          // No session, redirect to login
          toast.error("Login failed. Please try again.");
          navigate("/login");
        }
      } catch (error: any) {
        console.error("Error in auth callback:", error);
        toast.error(error.message || "An error occurred during authentication");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, setIsAuthenticated, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-primary-text">Completing your login...</p>
    </div>
  );
};

export default AuthCallback;
