import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";

import {
  supabase,
  signOut,
  getCurrentUser,
  getSession,
} from "./utils/supabase";

// Components
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import SuccessPage from "./components/navigation_pages/SuccessPage";
import OnboardingPage from "./components/navigation_pages/OnboardingPage";
import Header from "./components/navigation_page_elements/Header";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation helper functions
  const navigateToLogin = () => navigate("/login");
  const navigateToRegister = () => navigate("/register");

  // Logout function using the helper
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      setUser(null);
      navigate("/");
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToastContainer position="top-right" />

      {/* Persistent Header - Always visible with main navigation */}
      <Header
        loggedIn={!!user}
        page={location.pathname.substring(1) || "home"}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          {/* Default route is OnboardingPage */}
          <Route path="/" element={<OnboardingPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes - redirect to home if not logged in */}
          <Route
            path="/projects"
            element={user ? <div>Projects Page</div> : <Navigate to="/" />}
          />
          <Route
            path="/sessions"
            element={user ? <div>Sessions Page</div> : <Navigate to="/" />}
          />
          <Route
            path="/create"
            element={user ? <div>Create Page</div> : <Navigate to="/" />}
          />

          {/* Dashboard only accessible after login */}
          <Route
            path="/dashboard"
            element={
              user ? <SuccessPage username={user.email} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
