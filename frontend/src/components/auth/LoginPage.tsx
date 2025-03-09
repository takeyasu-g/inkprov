import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// The LoginPage component
export default function LoginPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // If remember me is not checked, set session to expire in 1 hour
        if (!rememberMe) {
          await supabase.auth.setSession({
            access_token: data.session?.access_token || "",
            refresh_token: data.session?.refresh_token || "",
          });
        }

        setIsAuthenticated(true);
        setUser(data.user);
        toast.success("Successfully logged in!");
        navigate("/projects");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login");
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/projects`,
          queryParams: {
            remember_me: rememberMe ? "true" : "false",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during Google login");
      setError(error.message || "An error occurred during Google login");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
      <ToastContainer />
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg border border-primary-border">
        <div>
          <h2 className="text-3xl font-bold text-primary-text text-center">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-secondary-text">
            Sign in to continue to Inkprov
          </p>
        </div>

        {error && (
          <div
            className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-primary-text"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-primary-text shadow-sm focus:border-ring focus:outline-none focus:ring-ring sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-text"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-primary-text shadow-sm focus:border-ring focus:outline-none focus:ring-ring sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-primary-text"
              >
                Remember me
              </label>
            </div>

            <Button
              type="button"
              variant="link"
              onClick={() => navigate("/reset-password")}
              className="text-primary-text hover:text-hover-text"
            >
              Forgot password?
            </Button>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-button hover:bg-primary-button-hover"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-secondary-text">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full border-input"
            >
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                  />
                </g>
              </svg>
              Continue with Google
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-secondary-text">
          Don't have an account?{" "}
          <Button
            type="button"
            variant="link"
            onClick={() => navigate("/register")}
            className="text-primary-text hover:text-hover-text font-medium"
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
}
