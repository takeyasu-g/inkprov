import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import WritingEditor from "../writing_pages/WritingEditor";
import Profile from "../navigation_pages/Profile";
import OpenSessionsPage from "../navigation_pages/OpenSessionsPage";
import ProjectsPage from "../navigation_pages/ProjectsPage";
import ReadingPage from "../navigation_pages/ReadingPage";
import CreateSessionPage from "../writing_pages/CreateSessionPage";
import AboutPage from "../pages/AboutPage";
import PrivacyPage from "../pages/PrivacyPage";
import Footer from "../Footer";
import AuthCallback from "../auth/AuthCallback";
import Layout from "./components/Layout";
import HomeOrLanding from "./components/HomeOrLanding";
import ProtectedRoute from "./components/ProtectedRoute";

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Layout>
          <HomeOrLanding />
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
          <OpenSessionsPage />
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
          <WritingEditor />
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
      <>
        <Layout>
          <PrivacyPage />
        </Layout>
        <Footer />
      </>
    ),
  },
  // {
  //   path: "/settings",
  //   element: (
  //     <>
  //       <Layout>
  //         <ProtectedRoute element={<Settings />} />
  //       </Layout>
  //       <Footer />
  //     </>
  //   ),
  // },
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
