import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// Protected route wrapper
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for session on mount
    supabase.auth.getSession().then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-primary-text">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
