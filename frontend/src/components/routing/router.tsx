import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";

// Import other page components when they're ready
// These are placeholders for now
const Dashboard = () => <div>Dashboard Page</div>;
const ResetPassword = () => <div>Reset Password Page</div>;
const VerificationSent = () => <div>Verification Email Sent</div>;

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/signup",
    element: <RegisterPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/verification-sent",
    element: <VerificationSent />,
  },
]);

// Render the app with RouterProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
