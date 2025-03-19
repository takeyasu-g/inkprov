import React, { useState, useEffect } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import WritingEditor from "../writing_pages/WritingEditor";
import LandingPage from "../navigation_pages/LandingPage";
import Settings from "../navigation_pages/Settings";
import Profile from "../navigation_pages/Profile";
import OpenSessionsPage from "../navigation_pages/OpenSessionsPage";
import ProjectsPage from "../navigation_pages/ProjectsPage";
import ReadingPage from "../navigation_pages/ReadingPage";
import CreateSessionPage from "../writing_pages/CreateSessionPage";
import AboutPage from "../pages/AboutPage";
import PrivacyPage from "../pages/PrivacyPage";
import Header from "../Header";
import Footer from "../Footer";
import { useAuth } from "@/contexts/AuthContext";

// Continue with Google requirement
import AuthCallback from "../auth/AuthCallback";

// Wrapper component for the layout and protected routes
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={
        window.location.pathname === "/login" ||
        window.location.pathname === "/register"
          ? "h-screen overflow-hidden "
          : window.location.pathname.startsWith("/writing") ||
            window.location.pathname.startsWith("/projects") ||
            window.location.pathname.startsWith("/sessions/create")
          ? "bg-white md:bg-background min-h-screen overflow-x-hidden"
          : `min-h-screen overflow-x-hidden`
      }
    >
      <Header loggedIn={isAuthenticated} page={window.location.pathname} />
      {children}
    </div>
  );
};

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

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Layout>
          <LandingPage />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <LoginPage />
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <RegisterPage />
      </Layout>
    ),
  },
  {
    path: "/sessions",
    element: (
      <>
        <Layout>
          <ProtectedRoute element={<OpenSessionsPage />} />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/sessions/create",
    element: (
      <>
        <Layout>
          <ProtectedRoute element={<CreateSessionPage />} />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/stories",
    element: (
      <>
        <Layout>
          <ProjectsPage />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/projects/:projectId/read",
    element: (
      <>
        <Layout>
          <ProtectedRoute element={<ReadingPage />} />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/writing/:projectId",
    element: (
      <>
        <Layout>
          <ProtectedRoute element={<WritingEditor />} />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/about",
    element: (
      <>
        <Layout>
          <AboutPage />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Layout>
        <PrivacyPage />
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <>
        <Layout>
          <ProtectedRoute element={<Settings />} />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/profile",
    element: (
      <>
        <Layout>
          <ProtectedRoute element={<Profile />} />
        </Layout>
        <Footer />
      </>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
