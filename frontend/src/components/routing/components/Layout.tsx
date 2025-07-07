import React from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

// Wrapper component for the layout and protected routes
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={
        window.location.pathname === "/login" ||
        window.location.pathname === "/register"
          ? "lg:overflow-hidden portrait:h-dvh landscape:h-full lg:landscape:h-dvh "
          : window.location.pathname.startsWith("/writing") ||
            window.location.pathname.startsWith("/projects") ||
            window.location.pathname.startsWith("/sessions/create")
          ? "bg-white md:bg-background min-h-screen overflow-x-hidden"
          : `min-h-screen overflow-x-hidden lg:flex lg:flex-col`
      }
    >
      <Header loggedIn={isAuthenticated} page={window.location.pathname} />
      {children}
    </div>
  );
};

export default Layout;
