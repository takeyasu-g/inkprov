import { createClient, User } from "@supabase/supabase-js";
import { ProjectSnippet, ProjectsData } from "@/types/global";

// local .env variables
// Supabase configuration
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY as string) || "";

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

// get all project snippets where id is provided project id
export const getProjectSnippets = async (
  projectId: string | undefined
): Promise<ProjectSnippet[] | null> => {
  const { data: projectSnippets, error } = await supabase
    .from("project_snippets")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    console.log("Error fetching project snippets", error);
    return null;
  }
  return projectSnippets;
};

// get project at Id .where is_completed = true
export const getProjectOfId = async (
  projectId: string | undefined
): Promise<ProjectsData | null> => {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_completed", true)
    .eq("id", projectId);

  if (error) {
    console.error("Error fetching sessions:", error);
    return null;
  }

  return project[0];
};

export const getSessions = async () => {
  try {
    // First, let's try a simpler query to test the connection
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_completed", false);

    if (error) {
      throw error;
    }

    // If the basic query works, then let's get the related data
    const { data: fullProject, error: fullError } = await supabase
      .from("projects")
      .select(
        `
        *,
        creator:users_ext!creator_id(
          auth_id,
          user_profile_name
        )
      `
      )
      .eq("is_completed", false);

    if (fullError) {
      console.error("Error fetching full session data:", fullError);
      console.error("Full error details:", fullError.details);
      return project; // Return basic project data if full query fails
    }

    console.log("Raw query result:", fullProject);
    if (fullProject && fullProject.length > 0) {
      console.log("First project creator:", fullProject[0].creator);
      console.log("Creator ID of first project:", fullProject[0].creator_id);
    }
    return fullProject || project;
  } catch (err) {
    return null;
  }
};

const getProjectsInprogress = async () => {
  const currentUser: User | null = await getCurrentUser();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("creator_id", currentUser?.id)
    .eq("is_completed", false);

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return project;
};

// get all projects + genre .where is_completed = true
export const getProjects = async (): Promise<ProjectsData[] | null> => {
  const currentUser: User | null = await getCurrentUser();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("creator_id", currentUser?.id)
    .eq("is_completed", true);

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return project;
};

// Function to fetch tags from Supabase
export const getTags = async () => {
  const { data, error } = await supabase.from("tags").select("*").order("name");

  if (error) {
    return [];
  }

  return data;
};

const getProfilePictureOptions = async () => {
  // Get the public URLs of the images
  const bookShelfImageData = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("BookShelf.png");
  const bookStackImageData = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("BookStack.png");
  const lanturnBookImageData = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("LanturnBook.png");

  return [
    bookShelfImageData.data.publicUrl,
    bookStackImageData.data.publicUrl,
    lanturnBookImageData.data.publicUrl,
  ];
};

const getProfilePicture = async () => {
  const currentUser: User | null = await getCurrentUser();

  const { data, error } = await supabase
    .from("users_ext")
    .select("profile_pic_url")
    .eq("auth_id", currentUser?.id);

  if (error) {
    throw new Error(`Failed to fetch profile picture: ${error.message}`);
  }

  return data[0].profile_pic_url;
};

const updateProfilePicture = async (url: string): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { error } = await supabase
    .from("users_ext")
    .update({ profile_pic_url: url })
    .eq("auth_id", currentUser?.id);

  if (error) {
    throw new Error(`Failed to update profile picture: ${error.message}`);
  }
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
    throw error;
  }
};

const updateBio = async (bio: string): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { error } = await supabase
    .from("users_ext")
    .update({ user_profile_bio: bio })
    .eq("auth_id", currentUser?.id);

  if (error) {
    throw error;
  }
};

const updateMatureContent = async (matureContent: boolean): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { error } = await supabase
    .from("users_ext")
    .update({ user_profile_mature_enabled: matureContent })
    .eq("auth_id", currentUser?.id);

  if (error) {
    throw error;
  }
};

const getUsername = async (): Promise<any> => {
  const currentUser: User | null = await getCurrentUser();

  const { data, error } = await supabase
    .from("users_ext")
    .select("user_profile_name")
    .eq("auth_id", currentUser?.id);

  if (error) {
    throw error;
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
    throw error;
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
    throw error;
  }

  return data;
};

export {
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getProjectsInprogress,
  getProfilePictureOptions,
  getProfilePicture,
  getUsername,
  getBio,
  getMatureContent,
  getSession,
  insertUsername,
  updateProfilePicture,
  updateUsername,
  updateBio,
  updateMatureContent,
};
