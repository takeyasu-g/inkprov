import { createClient, User } from "@supabase/supabase-js";
import {
  CompletedStoriesData,
  ProjectSnippet,
  ProjectsData,
} from "@/types/global";

// local .env variables
// Supabase configuration
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY as string) || "";

const supabase = createClient(supabaseUrl, supabaseKey);

// MARK: auth routes
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

/* PROJECTS and SESSIONS 
Sessions are uncompleted projects. 
Reasoning - if a Project has a is_completed value of false, we semantically consider it a "session", "writing session", or "open writing session". 
For clarity in the backend, only the terms "session", "sessions", "project",and "projects" should be utilized

/* PROJECT INFORMATION ROUTES */

/* ** These routes should be used to retrieve completed project data only ** */

// get all project snippets where id is provided project id
export const getProjectSnippets = async (
  projectId: string | undefined
): Promise<ProjectSnippet[] | null> => {
  const { data: projectSnippets, error } = await supabase
    .from("project_snippets")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
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

/* SESSION INFORMATION ROUTES */

export const getSessions = async () => {
  try {
    // only get projects that have not been flagged as completed
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_completed", false);

    if (error) {
      throw error;
    }

    // if the basic query succeeds, then get the data we need
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

    // Update the contributor counts with real-time data
    if (fullProject && fullProject.length > 0) {
      try {
        // For each project, get the actual count of contributors
        for (const project of fullProject) {
          const { data: contributors, error: countError } = await supabase
            .from("project_contributors")
            .select("id")
            .eq("project_id", project.id);

          if (countError) {
            console.error(
              `Error fetching contributors for project ${project.id}:`,
              countError
            );
          } else if (contributors) {
            const realCount = contributors.length;
            if (realCount !== project.current_contributors_count) {
              project.current_contributors_count = realCount;

              // Also update the project table to keep it in sync
              const { error: updateError } = await supabase
                .from("projects")
                .update({ current_contributors_count: realCount })
                .eq("id", project.id);

              if (updateError) {
                console.error(
                  `Error updating project count in database:`,
                  updateError
                );
              }
            }
          }
        }
      } catch (countErr) {
        console.error("Error updating contributor counts:", countErr);
      }
    }

    return fullProject || project;
  } catch (err) {
    console.error("Error in getSessions:", err);
    return null;
  }
};

const getProjectsInprogress = async () => {
  const currentUser: User | null = await getCurrentUser();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("creator_id", currentUser?.id)
    .eq("is_completed", false);

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return projects;
};
// get all projects + genre where is_completed = true
export const getProjects = async (): Promise<CompletedStoriesData[] | null> => {
  try {
    const currentUser: User | null = await getCurrentUser();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("creator_id", currentUser?.id)
      .eq("is_completed", true);

    if (error) {
      console.error("Error fetching projects:", error.message);
      console.error("Error details:", error.details);
      return null;
    }

    return data as CompletedStoriesData[];
  } catch (err) {
    console.error("Exception in getProjects:", err);
    return null;
  }
};

/* ----- UTILITY ROUTES ----- */

// function to fetch tags (currently just used for genres) from Supabase
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

// inserts the user's chosen username into their profile, default behaviour

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

/* ----- USER PROFILE / INFORMATION ROUTES ----- */

// handles the user updating their username using the field in settings.

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

// updates the user bio field
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

// enable viewing mature content flag on user profile
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

// returns the verbose username by user id
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

// retrieve user bio information
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

// handles checking if the user
// TODO: needs to be renamed to be more explicit: should be "getUserHasEnabledMatureContent"
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

// explicit function to get all contributors to a given project (type definitions are here temporarily for debugging)
// update: seems to be working in production, leaving as is

// update: seems to be working in production, leaving as is

// Typing
export interface Contributor {
  id: string;
  user_id: string;
  project_id: string;
  user_made_contribution: boolean;
  current_writer: boolean;
  joined_at?: string;
  last_contribution_at?: string;
  user?: {
    id: string;
    user_profile_name: string;
  };
}

// handles getting the user information for all contributors on a project
// something on the supabase side warrants this level of overengineering, so please do not attempt to refactor

async function getProjectContributors(projectId: string) {
  try {
    const { data: contributors, error: contributorsError } = await supabase
      .from("project_contributors")
      .select("*")
      .eq("project_id", projectId);

    if (contributorsError) {
      console.error("Error fetching project contributors:", contributorsError);
      return [];
    }
    if (!contributors || contributors.length === 0) {
      return [];
    }
    const userIds = contributors.map((contributor) => contributor.user_id);
    const { data: usersData, error: usersError } = await supabase
      .from("users_ext")
      .select("id, user_profile_name")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching user data:", usersError);
      return contributors.map((contributor) => ({
        ...contributor,
        user: { id: contributor.user_id, user_profile_name: "Unknown" },
      }));
    }
    const enrichedContributors = contributors.map((contributor) => {
      const user = usersData?.find((user) => user.id === contributor.user_id);

      return {
        ...contributor,
        user_made_contribution: contributor.user_made_contribution || false,
        current_writer: contributor.current_writer || false,
        user_is_project_creator: contributor.user_is_project_creator || false,
        last_contribution_at:
          contributor.last_contribution_at ||
          contributor.joined_at ||
          new Date().toISOString(),
        user: user || { id: contributor.user_id, user_profile_name: "Unknown" },
      };
    });

    return enrichedContributors;
  } catch (err) {
    console.error("Exception when fetching project contributors:", err);
    return [];
  }
}

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
  getProjectContributors,
  getSession,
  insertUsername,
  updateProfilePicture,
  updateUsername,
  updateBio,
  updateMatureContent,
};
