import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import WritingEditor from "../writing_pages/WritingEditor";
import LandingPage from "../navigation_pages/LandingPage";
import Settings from "../navigation_pages/Settings";
import OpenSessionsPage from "../navigation_pages/OpenSessionsPage";
import ProjectsPage from "../navigation_pages/ProjectsPage";
import ReadingPage from "../navigation_pages/ReadingPage";
import CreateSessionPage from "../writing_pages/CreateSessionPage";
import AboutPage from "../pages/AboutPage";
import Header from "../Header";
import Footer from "../Footer";
import { useAuth } from "@/contexts/AuthContext";

// Wrapper component for the layout and protected routes
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <Header
        loggedIn={isAuthenticated}
        page={isAuthenticated ? "dashboard" : "landing"}
      />
      {children}
      <Footer />
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <LandingPage />
      </Layout>
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
      <Layout>
        <ProtectedRoute element={<OpenSessionsPage />} />
      </Layout>
    ),
  },
  {
    path: "/sessions/create",
    element: (
      <Layout>
        <ProtectedRoute element={<CreateSessionPage />} />
      </Layout>
    ),
  },
  {
    path: "/projects",
    element: (
      <Layout>
        <ProtectedRoute element={<ProjectsPage />} />
      </Layout>
    ),
  },
  {
    path: "/projects/:projectId/read",
    element: (
      <Layout>
        <ProtectedRoute element={<ReadingPage />} />
      </Layout>
    ),
  },
  {
    path: "/writing/:projectId",
    element: (
      <Layout>
        <ProtectedRoute element={<WritingEditor />} />
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <AboutPage />
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <ProtectedRoute element={<Settings />} />
      </Layout>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
