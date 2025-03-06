import { useState } from "react";
import "./styles/App.css";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

const App: React.FC = () => {
  // State to track which page to show
  const [showLogin, setShowLogin] = useState<boolean>(true);

  // Toggle between login and register pages
  const toggleAuth = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold underline mb-6">Hello world!</h1>

      {/* Conditionally render either LoginPage or RegisterPage */}
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
    </div>
  );
};

export default App;
