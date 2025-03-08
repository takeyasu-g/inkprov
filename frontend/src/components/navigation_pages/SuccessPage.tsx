import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../navigation_page_elements/Header";

interface SuccessPageProps {
  username?: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ username = "User" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // Navigate back to login page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mt-16">
        <h1 className="text-2xl font-bold text-primary-text">
          Successfully Logged In!
        </h1>
        <p className="mt-4 text-primary-text">Welcome, {username}</p>
        <p className="mt-2 text-secondary-text">
          You have successfully authenticated into the application.
        </p>
        <button
          onClick={handleLogout}
          className="mt-8 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
