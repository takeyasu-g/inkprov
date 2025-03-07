import React from "react";
import { useLocation } from "react-router-dom";

/**
 * NavigationPage component that serves as a placeholder for different routes
 * It displays the current page name extracted from the URL path
 */
const NavigationPage: React.FC = () => {
  // Get the current location from react-router
  const location = useLocation();

  // Extract the page name from the path (remove leading slash and capitalize)
  const pageName = location.pathname.substring(1) || "Home";
  const formattedPageName =
    pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div
      className="navigation-page-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        className="page-content"
        style={{
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#333",
            marginBottom: "1rem",
          }}
        >
          {formattedPageName} Page
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
          }}
        >
          {formattedPageName} page placeholder
        </p>
      </div>
    </div>
  );
};

export default NavigationPage;
