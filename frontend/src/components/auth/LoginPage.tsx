import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/utils/formSchemas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// The LoginPage component
export default function LoginPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Form Validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form submission
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);

      // Login user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
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
        navigate("/sessions");
      }
    } catch (dataError: any) {
      setIsLoading(false);
      toast.error(dataError.message || "An dataError occurred during login");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during Google sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-full grid grid-cols-1 lg:grid-cols-2 ">
      {/* Left Column */}
      <div className="bg-accent w-full lg:flex justify-center order-2 lg:order-1 hidden">
        <div className="relative w-100 h-87 mt-10 top-35 ">
          {/* Styled Borders */}
          <div className="absolute -inset-4 rounded-lg bg-tertiary-background rotate-2"></div>
          <div className="relative w-full h-full rounded-lg border-8 border-white bg-white shadow-lg flex items-center justify-center text-tertiary-text">
            {/* Styled Content */}
            <div className="p-4">
              <BookOpen size={44} />
              <h1 className="text-2xl font-bold text-primary-text text-center mt-2">
                Join our writing community
              </h1>
              <p className="text-sm text-secondary-text text-left mt-2">
                "The act of writing is an act of optimism. You would not take
                the trouble to do it if you felt it didn"t matter."
              </p>
              <p className="text-sm text-tertiary-text text text-right mt-2">
                - Edwared Albee
              </p>
              <div className="mt-3 flex justify-center">
                <div className="h-px w-16 my-2 bg-tertiary-background"></div>
              </div>
              <p className="text-sm text-tertiary-text text-left my-3">
                Inkprov brings writers together in a cozy, collaborative
                environment where creaativity flows freely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full px-8 flex justify-center order-1 lg:order-2 py-15">
        <div className="w-full max-w-md space-y-8 bg-background rounded-lg">
          <div>
            <h2 className="text-3xl font-bold text-primary-text text-center">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-secondary-text">
              Sign in to continue your writing journey
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              className="mt-8 space-y-3 flex flex-col items-center"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-4 w-[90%]">
                <div>
                  {/* Email Input */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-primary-text text-left">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                            placeholder=""
                            type="email"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage className="text-left">
                          {form.formState.errors.email?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  {/* Password Input */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-primary-text text-left">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PasswordInput
                              disabled={isLoading}
                              className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                              placeholder=""
                              {...field}
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="text-left">
                          {form.formState.errors.password?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                setRememberMe(
                                  checked === true || checked === false
                                    ? checked
                                    : false
                                );
                              }}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border border-primary-button focus:ring-ring cursor-pointer accent-primary-button-hover"
                            />
                            <FormLabel className="text-sm font-medium text-primary-text">
                              Remember me
                            </FormLabel>
                          </div>
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          {/* Form error Message */}
                          <FormMessage className="text-left" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="link"
                  disabled={isLoading}
                  onClick={() => navigate("/reset-password")}
                  className="text-primary-text hover:text-hover-text font-medium no-underline hover:no-underline cursor-pointer"
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <div className="space-y-4 w-[80%] ">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-button mt-4 mb-5 hover:bg-primary-button-hover cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" /> Signing in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-secondary-text">
                      Or
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </Form>
          <div className="w-ful flex justify-center">
            <Button
              className="w-[80%] not-last:mt-1 bg-secondary-button text-secondary-text hover:bg-secondary-button-hover border border-primary-border cursor-pointer"
              variant="default"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
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

          <p className="text-center text-sm text-secondary-text">
            Don't have an account?
            <Button
              type="button"
              variant="link"
              onClick={() => navigate("/register")}
              className="text-primary-text hover:text-hover-text font-medium no-underline hover:no-underline cursor-pointer"
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </main>
  );
}
