import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import HomePage from "@/pages/HomePage/HomePage";
import LandingPage from "@/components/navigation_pages/LandingPage";

const HomeOrLanding: React.FC = () => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    // You can use a spinner, skeleton, or just a blank div
    return <></>;
  }

  return isAuthenticated ? <HomePage /> : <LandingPage />;
};

export default HomeOrLanding;
