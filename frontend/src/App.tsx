import React from "react";
import "./styles/App.css";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import router from "./components/routing/router";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" duration={3000} theme="light" richColors />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
