// src/components/auth/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This will handle the OAuth redirect
    const handleAuthStateChange = async () => {
      try {
        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // User is logged in, redirect to the main app page
          navigate("/stories");
        } else {
          // No session, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate("/login");
      }
    };

    handleAuthStateChange();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-primary-text">Completing your login...</p>
    </div>
  );
};

export default AuthCallback;
