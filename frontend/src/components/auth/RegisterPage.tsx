import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/utils/formSchemas";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { BookText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Validation
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {

      setIsLoading(true);

      // Sign up user

      const response = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/sessions`,
          data: {
            username: values.email.substring(0, values.email.indexOf("@")),
            full_name: values.email.substring(0, values.email.indexOf("@")),

          },
        },
      });

      console.log("Signup response:", response);

      if (response.error) {
        console.error("Signup error details:", response.error);
        throw response.error;
      }


      if (response.data?.user) {
        console.log("User created successfully:", response.data.user);

        // Try to create the profile manually if needed
        const { error: profileError } = await supabase
          .from("users_ext")
          .insert([
            {
              id: crypto.randomUUID(), // Generate a new UUID
              user_profile_mature_enabled: false,
              user_profile_bio: null,
              user_profile_name: email,
              auth_id: response.data.user.id,
              profile_pic_url: null,
              user_email: email,
            },
          ])
          .single();

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw here, as the user is already created
        }

        toast.success("Registration successful! Please login to continue.");



        // Redirect to sessions page after successful registration
        setTimeout(() => {
          navigate("/sessions");
        }, 2000);
      

    } catch (error: any) {
      setIsLoading(false);
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during registration");
      setError(error.message || "An error occurred during registration");
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/sessions`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during Google sign up");
      setError(error.message || "An error occurred during Google sign up");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background grid grid-cols-2 grid-rows-1 gap-0">
      {/* Left Column */}
      <div
        className="row-span-5 bg-accent relative pb-4 
  before:absolute before:inset-y-0 before:left-[-100vw] before:w-[100vw] before:-z-10 before:bg-accent"
      >
        <div className="relative w-100 h-75 mt-10 top-20">
          {/* Styled Borders */}
          <div className="absolute -inset-4 rounded-lg bg-tertiary-background rotate-2"></div>
          <div className="relative w-full h-full rounded-lg border-8 border-white bg-white shadow-lg flex items-center justify-center text-tertiary-text">
            {/* Styled Content */}
            <div className="p-4">
              <BookText size={44} />
              <h1 className="text-2xl font-bold text-primary-text text-center mt-4">
                Begin your Writing Adventure
              </h1>
              <p className="text-sm text-secondary-text text-left mt-2">
                "There is no greater agony than bearing an untold story inside
                you."
              </p>
              <p className="text-sm text-tertiary-text text text-right mt-2">
                - Maya Angelou
              </p>
              <div className="mt-6 flex justify-center">
                <div className="h-px w-16 bg-tertiary-background"></div>
              </div>
              <p className="text-sm text-tertiary-text text text-left mt-2">
                Join Inkprov today and turn your ideas into colaborative
                masterpieces with fellow writers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="row-span-5 mt-3">
        <ToastContainer />
        <div className="w-full float-right max-w-md space-y-8 bg-background p-8 rounded-lg">
          <div>
            <h2 className="text-3xl font-bold text-primary-text text-center">
              Create an account
            </h2>
            <p className="mt-2 text-center text-secondary-text">
              Join our community of writers.
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

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-3"
            >
              <div className="space-y-4">
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
                            required
                            {...field}
                          />
                        </FormControl>

                        {/* Form Error Message */}
                        <FormMessage className="text-left" />
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
                        <FormDescription className="text-xs text-secondary-text text-left">
                          Minimum 6 Characters
                        </FormDescription>
                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  {/* Confirm Password Input */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-primary-text text-left">
                          Confirm Password
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
                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-button mt-4 hover:bg-primary-button-hover cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" /> Creating Account
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 my-2 bg-background text-secondary-text">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                className="bg-secondary-button text-secondary-text hover:bg-secondary-button-hover border border-primary-border cursor-pointer w-full"
                variant="default"
                disabled={isLoading}
                onClick={handleGoogleSignUp}
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
            </form>
          </Form>

          <p className="text-center text-sm text-secondary-text">
            Already have an account?
            <Button
              type="button"
              variant="link"
              onClick={() => navigate("/login")}
              className="text-primary-text hover:text-hover-text font-medium no-underline hover:no-underline cursor-pointer"
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
