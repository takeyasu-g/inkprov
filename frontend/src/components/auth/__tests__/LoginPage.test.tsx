/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import LoginPage from "../LoginPage";
import { supabase } from "../../../utils/supabase";

// Mock the dependencies
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => null,
}));

jest.mock("../../../utils/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders login form", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    // Mock successful login response
    const mockUser = { id: "1", email: "test@example.com" };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(toast.success).toHaveBeenCalledWith("Successfully logged in!");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles login error", async () => {
    // Mock login error response
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
  });

  it("handles unconfirmed email error", async () => {
    // Mock unconfirmed email error response
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Email not confirmed" },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          "Please check your email to confirm your account before logging in."
        )
      ).toBeInTheDocument();
    });
  });

  it("handles Google login", async () => {
    // Mock successful Google OAuth response
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Click the Google login button
    fireEvent.click(screen.getByText("Google"));

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.any(String),
        },
      });
    });
  });

  it("disables submit button while loading", async () => {
    // Mock a delayed login response
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    // Button should be disabled and show loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
  });
});
