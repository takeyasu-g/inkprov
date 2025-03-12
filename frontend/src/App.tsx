import React from "react";
import "./styles/App.css";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import router from "./components/routing/router";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
