import { createClient } from "@supabase/supabase-js";

// These variables should be in your .env file!
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Service Role Key are required.");
}

/**
 * The Supabase client instance.
 * We use the SERVICE_ROLE_KEY for backend operations to bypass Row Level Security.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
