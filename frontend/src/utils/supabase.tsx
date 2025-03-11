import { createClient, User } from "@supabase/supabase-js";

// local .env variables
// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string || "";

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for authentication
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// Function to fetch tags from Supabase
export const getTags = async () => {
  const { data, error } = await supabase.from("tags").select("*").order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data;
};

const insertUsername = async (): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { data, error } = await supabase
    .from("users_ext")
    .insert({ user_profile_name: currentUser?.email?.substring(0, currentUser?.email?.indexOf("@")), auth_id: currentUser?.id })
    .select();

  return { data, error };
};


const updateUsername = async (username: string): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { error } = await supabase
  .from("users_ext")
  .update({ user_profile_name: username })
  .eq("auth_id", currentUser?.id)

  if (error) {
    console.error("Error updating username:", error);
  }
};

const updateBio = async (bio: string): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { error } = await supabase
    .from("users_ext")
    .update({ user_profile_bio: bio })
    .eq("auth_id", currentUser?.id);

    if (error) {
      console.error("Error updating bio:", error);
    }
};

const updateMatureContent = async (matureContent: boolean): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();
  
  const { error } = await supabase
    .from("users_ext")
    .update({ user_profile_mature_enabled: matureContent })
    .eq("auth_id", currentUser?.id);

    if (error) {
      console.error("Error updating mature content preference:", error);
    }
};

const getUsername = async (): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { data, error } = await supabase
    .from("users_ext")
    .select("user_profile_name")
    .eq("auth_id", currentUser?.id);

    if (error) {
      console.error("Error getting username:", error);
    }

  return data;
};

const getBio = async (): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { data, error } = await supabase
    .from("users_ext")
    .select("user_profile_bio")
    .eq("auth_id", currentUser?.id);

    if (error) {
      console.error("Error getting bio:", error);
    }

  return data;
};

const getMatureContent = async (): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { data, error } = await supabase
    .from("users_ext")
    .select("user_profile_mature_enabled")
    .eq("auth_id", currentUser?.id);

    if (error) {
      console.error("Error getting mature content preference:", error);
    }

  return data;
};



export {
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getUsername,
  getBio,
  getMatureContent,
  getSession,
  insertUsername,
  updateUsername,
  updateBio,
  updateMatureContent
};