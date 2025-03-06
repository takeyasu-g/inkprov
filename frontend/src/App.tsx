import { useState } from "react";
import "./styles/App.css";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import { ToastContainer, toast } from "react-toastify";

const App: React.FC = () => {
  // State to track which page to show
  const [showLogin, setShowLogin] = useState<boolean>(true);

  // Toggle between login and register pages
  const toggleAuth = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className='container mx-auto p-4'>
      {/* Conditionally renders either LoginPage or RegisterPage */}
      <header>Placeholder for Header</header>
      {/* Header will go here when completed */}
      <div className='auth-container'>
        {showLogin ? (
          <>
            <LoginPage />
            <p className='mt-4 text-center'>
              Don't have an account?{" "}
              <button
                onClick={toggleAuth}
                className='text-blue-500 hover:text-blue-700 font-medium'
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterPage />
            <p className='mt-4 text-center'>
              Already have an account?{" "}
              <button
                onClick={toggleAuth}
                className='text-blue-500 hover:text-blue-700 font-medium'
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
