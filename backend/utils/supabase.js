import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create a Supabase client with the service role key for backend operations
// The service role key bypasses Row Level Security, so it should ONLY be used on the server
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions for database operations

// Get user profile by ID
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  return { data, error };
};

// Verify a user's session token from the frontend
export const verifyUser = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  return { data, error };
};
