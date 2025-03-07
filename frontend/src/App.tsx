// Tanner's Header component
import React, { useState } from "react";
import "./styles/App.css";
import { Routes, Route, Navigate } from "react-router-dom"; // Remove BrowserRouter

import Header from "./components/Header";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import SuccessPage from "./components/SuccessPage";
import NavigationPage from "./components/NavigationPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <>
      <ToastContainer /> {/* Global toast container */}
      <div className="container mx-auto p-4">
        <Header loggedIn={false} page="landing" />
        
        <Routes>
          {/* Auth page will handle toggle between login and register */}
          <Route path="/" element={<AuthPage />} />

          {/* Direct routes to login/register if needed */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes after authentication */}
          <Route path="/placeholder" element={<NavigationPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/dashboard" element={<NavigationPage />} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

// Separate component for handling auth page with toggle
const AuthPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  const toggleAuth = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="auth-container">
      {showLogin ? (
        <>
          <LoginPage />
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <button
              onClick={toggleAuth}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <RegisterPage />
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <button
              onClick={toggleAuth}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Log in
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default App;
