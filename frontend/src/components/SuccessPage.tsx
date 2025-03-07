import React from "react";
import { useNavigate } from "react-router-dom";

interface SuccessPageProps {
  username?: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ username = "User" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // placeholder for handling user logout and dumping them back to login / signup page
    navigate("/"); // Navigate back to login page
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Successfully Logged In!</h1>
      <p>Welcome, {username}</p>
      <p>You have successfully authenticated into the application.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "8px 16px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default SuccessPage;
