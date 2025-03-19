import { createClient, User } from "@supabase/supabase-js";
import {
  CompletedStoriesData,
  ProjectSnippet,
  ProjectsData,
  UserProfilePopUp,
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
    .eq("project_id", projectId)
    .order("sequence_number", { ascending: true }); // order snippets by sequence_number

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
export const getProjects = async (): Promise<ProjectsData[] | null> => {
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

    return data as ProjectsData[];
  } catch (err) {
    console.error("Exception in getProjects:", err);
    return null;
  }
};

export const getAllStoriesWithProfileName = async (): Promise<
  CompletedStoriesData[] | null
> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        description,
        project_genre,
        creator_id,
        users_ext!projects_creator_id_fkey(   
        user_profile_name
        ),
        updated_at,
        created_at,
        current_contributors_count,
        is_mature_content
      `
      )
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
  const user_avatar_01 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_01.png");
  const user_avatar_02 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_02.png");
  const user_avatar_03 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_03.png");
  const user_avatar_04 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_04.png");
  const user_avatar_05 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_05.png");
  const user_avatar_06 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_06.png");
  const user_avatar_07 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_07.png");
  const user_avatar_08 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_08.png");
  const user_avatar_09 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_09.png");
  const user_avatar_10 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_10.png");
  const user_avatar_11 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_11.png");
  const user_avatar_12 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_12.png");
  const user_avatar_13 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_13.png");
  const user_avatar_14 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_14.png");
  const user_avatar_15 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_15.png");
  const user_avatar_16 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_16.png");
  const user_avatar_17 = supabase.storage
    .from("user-profile-pictures")
    .getPublicUrl("user_avatar_17.png");

  return [
    bookShelfImageData.data.publicUrl,
    bookStackImageData.data.publicUrl,
    lanturnBookImageData.data.publicUrl,
    user_avatar_01.data.publicUrl,
    user_avatar_02.data.publicUrl,
    user_avatar_03.data.publicUrl,
    user_avatar_04.data.publicUrl,
    user_avatar_05.data.publicUrl,
    user_avatar_06.data.publicUrl,
    user_avatar_07.data.publicUrl,
    user_avatar_08.data.publicUrl,
    user_avatar_09.data.publicUrl,
    user_avatar_10.data.publicUrl,
    user_avatar_11.data.publicUrl,
    user_avatar_12.data.publicUrl,
    user_avatar_13.data.publicUrl,
    user_avatar_14.data.publicUrl,
    user_avatar_15.data.publicUrl,
    user_avatar_16.data.publicUrl,
    user_avatar_17.data.publicUrl,
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

// get profilesData for popup in ReadingPage
export const getProfilesByUserIdsForPopUp = async (
  userIds: string[]
): Promise<UserProfilePopUp[] | []> => {
  const { data, error } = await supabase
    .from("users_ext")
    .select("id, user_profile_name, profile_pic_url, user_email")
    .in("id", userIds);

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return data;
};

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

/* ----- PROJECT REACTIONS ROUTES ----- */

// Get the current user's reaction for a specific project
export const getUserProjectReaction = async (
  projectId: string
): Promise<string | null> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const { data, error } = await supabase
    .from("reactions")
    .select(
      "reaction_cool, reaction_funny, reaction_sad, reaction_heartwarming, reaction_interesting, reaction_scary"
    )
    .eq("project_id", projectId)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user reaction:", error);
    return null;
  }

  // Find which reaction field is true
  if (!data) return null;

  if (data.reaction_cool) return "cool";
  if (data.reaction_funny) return "funny";
  if (data.reaction_sad) return "sad";
  if (data.reaction_heartwarming) return "heartwarming";
  if (data.reaction_interesting) return "interesting";
  if (data.reaction_scary) return "scary";

  return null;
};

// Add or update a reaction to a project
export const addOrUpdateProjectReaction = async (
  projectId: string,
  reactionType: string
): Promise<boolean> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return false;
  }

  // Create reaction data with all fields set to false
  const reactionData = {
    reaction_cool: false,
    reaction_funny: false,
    reaction_sad: false,
    reaction_heartwarming: false,
    reaction_interesting: false,
    reaction_scary: false,
    project_id: projectId,
    user_id: currentUser.id,
  };

  // Set the selected reaction to true if provided
  if (reactionType) {
    // Update the correct reaction field based on the type
    switch (reactionType) {
      case "cool":
        reactionData.reaction_cool = true;
        break;
      case "funny":
        reactionData.reaction_funny = true;
        break;
      case "sad":
        reactionData.reaction_sad = true;
        break;
      case "heartwarming":
        reactionData.reaction_heartwarming = true;
        break;
      case "interesting":
        reactionData.reaction_interesting = true;
        break;
      case "scary":
        reactionData.reaction_scary = true;
        break;
    }
  }

  // First check if the user already has a reaction for this project
  const { data: existingReaction, error: lookupError } = await supabase
    .from("reactions")
    .select("*") // Select all columns instead of just "id"
    .eq("project_id", projectId)
    .eq("user_id", currentUser.id)
    .maybeSingle(); // Changed from .single() to avoid errors

  if (lookupError) {
    console.error("Error looking up existing reaction:", lookupError);
    return false;
  }

  if (existingReaction) {
    if (!reactionType) {
      // If user clicked the same reaction again (to remove it),
      // delete the reaction entry entirely
      const { error: deleteError } = await supabase
        .from("reactions")
        .delete()
        .match({ project_id: projectId, user_id: currentUser.id });

      if (deleteError) {
        console.error("Error deleting reaction:", deleteError);
        return false;
      }
    } else {
      // Update existing reaction
      const { error: updateError } = await supabase
        .from("reactions")
        .update(reactionData)
        .match({ project_id: projectId, user_id: currentUser.id });

      if (updateError) {
        console.error("Error updating reaction:", updateError);
        return false;
      }
    }
  } else {
    // Insert new reaction only if a reaction type is provided
    if (reactionType) {
      const { error: insertError } = await supabase
        .from("reactions")
        .insert(reactionData);

      if (insertError) {
        console.error("Error adding reaction:", insertError);
        return false;
      }
    } else {
      // No reaction to add
      return true;
    }
  }

  return true;
};

// Get counts of reactions for a project
export const getProjectReactionCounts = async (
  projectId: string
): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from("reactions")
    .select(
      "reaction_cool, reaction_funny, reaction_sad, reaction_heartwarming, reaction_interesting, reaction_scary"
    )
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching project reactions:", error);
    return {};
  }

  // Count reactions by type
  const counts: Record<string, number> = {
    cool: 0,
    funny: 0,
    sad: 0,
    heartwarming: 0,
    interesting: 0,
    scary: 0,
  };

  data.forEach((item) => {
    if (item.reaction_cool) counts.cool++;
    if (item.reaction_funny) counts.funny++;
    if (item.reaction_sad) counts.sad++;
    if (item.reaction_heartwarming) counts.heartwarming++;
    if (item.reaction_interesting) counts.interesting++;
    if (item.reaction_scary) counts.scary++;
  });

  return counts;
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
  getProjectContributors,
  getSession,
  insertUsername,
  updateProfilePicture,
  updateUsername,
  updateBio,
  updateMatureContent,
};
