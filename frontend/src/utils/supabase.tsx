import { createClient, User } from "@supabase/supabase-js";

// local .env variables
// Supabase configuration
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY as string) || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
}

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

// get all projects + genre .where is_completed = false
export const getSessions = async () => {
  try {
    // First, let's try a simpler query to test the connection
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_completed", false);

    if (error) {
      console.error("Error fetching sessions:", error);
      return null;
    }

    // If the basic query works, then let's get the related data
    const { data: fullProject, error: fullError } = await supabase
      .from("projects")
      .select(
        `
        *,
        creator:users_ext (
          auth_id,
          user_profile_name,
          avatar_url
        ),
        project_contributors (
          contributor:users_ext (
            auth_id,
            user_profile_name,
            avatar_url
          )
        )
      `
      )
      .eq("is_completed", false);

    if (fullError) {
      console.error("Error fetching full session data:", fullError);
      console.error("Full error details:", fullError.details);
      return project; // Return basic project data if full query fails
    }

    console.log("Fetched sessions with full data:", fullProject);
    console.log("Creator data sample:", fullProject?.[0]?.creator);
    return fullProject;
  } catch (err) {
    console.error("Unexpected error in getSessions:", err);
    return null;
  }
};

// get all projects + genre .where is_completed = true
export const getProjects = async () => {
  try {
    // First, let's try a simpler query to test the connection
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_completed", true);

    if (error) {
      console.error("Error fetching sessions:", error);
      return null;
    }

    // If the basic query works, then let's get the related data
    const { data: fullProject, error: fullError } = await supabase
      .from("projects")
      .select(
        `
        *,
        creator:users_ext!creator_id (
          auth_id,
          user_profile_name,
          avatar_url
        ),
        project_contributors (
          contributor:users_ext!contributor_id (
            auth_id,
            user_profile_name,
            avatar_url
          )
        )
      `
      )
      .eq("is_completed", true);

    if (fullError) {
      console.error("Error fetching full project data:", fullError);
      return project; // Return basic project data if full query fails
    }

    console.log("Fetched projects:", fullProject || project);
    return fullProject || project;
  } catch (err) {
    console.error("Unexpected error in getProjects:", err);
    return null;
  }
};

// // get all projects + genre .where is_completed = true
// export const getProjects = async () => {
//   const { data: project, error } = await supabase
//     .from("projects")
//     .select(
//       `
//       *,
//       creator:users_ext(
//         auth_id,
//         user_profile_name
//       ),
//         project_contributors (
//           contributor:users_ext!contributor_id (
//             auth_id,
//             user_profile_name,
//             avatar_url
//           )
//       )
//     `
//     )
//     .eq("is_completed", true);

//   if (error) {
//     console.error("Error fetching sessions:", error);
//     return null;
//   }

//   return project;
// };

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
    .insert({
      user_profile_name: currentUser?.email?.substring(
        0,
        currentUser?.email?.indexOf("@")
      ),
      auth_id: currentUser?.id,
    })
    .select();

  return { data, error };
};

const updateUsername = async (username: string): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { error } = await supabase
    .from("users_ext")
    .update({ user_profile_name: username })
    .eq("auth_id", currentUser?.id);

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
  updateMatureContent,
};
