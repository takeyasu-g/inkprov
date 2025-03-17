import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-primary-text sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">Inkprov</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-secondary-text sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Unleash your creativity with collaborative writing sessions. Join a
            community of writers, share ideas, and create stories together in
            real-time.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="text-primary-text hover:text-hover-text"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-primary-button hover:bg-primary-button-hover"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="mt-32">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-background rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-primary-text tracking-tight">
                    Real-time Collaboration
                  </h3>
                  <p className="mt-5 text-base text-secondary-text">
                    Write together with other authors in real-time, seeing
                    changes as they happen.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-background rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-primary-text tracking-tight">
                    Writing Sessions
                  </h3>
                  <p className="mt-5 text-base text-secondary-text">
                    Join or create writing sessions with different themes and
                    prompts.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-background rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-primary-text tracking-tight">
                    Project Management
                  </h3>
                  <p className="mt-5 text-base text-secondary-text">
                    Organize your writing projects and track progress with
                    built-in tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
