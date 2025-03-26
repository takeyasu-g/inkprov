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
  // Skip execution if projectId is undefined
  if (!projectId) return null;

  const { data: projectSnippets, error } = await supabase
    .from("project_snippets")
    .select(
      `
      *,
      creator:users_ext!creator_id(
        user_profile_name,
        id
      )
    `
    )
    .eq("project_id", projectId)
    .order("sequence_number", { ascending: true });

  if (error) {
    console.error("Error fetching project snippets:", error);
    return null;
  }

  // Get instructor status for each creator
  if (projectSnippets?.length) {
    // Get unique creator IDs
    const creatorIds = [
      ...new Set(projectSnippets.map((snippet) => snippet.creator_id)),
    ];

    // Fetch instructor status for all creators at once
    const { data: statsData } = await supabase
      .from("user_gamification_stats")
      .select("user_id, is_cc_instructor")
      .in("user_id", creatorIds);

    // Create a map of user_id to instructor status
    const instructorMap = new Map();
    if (statsData) {
      statsData.forEach((stat) => {
        instructorMap.set(stat.user_id, !!stat.is_cc_instructor);
      });
    }

    // Add instructor flag to each snippet's creator
    return projectSnippets.map((snippet) => ({
      ...snippet,
      creator: {
        ...snippet.creator,
        is_instructor: instructorMap.get(snippet.creator_id) || false,
      },
    }));
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
    // Get the current user's mature content preference
    const user = await getCurrentUser();
    let maturePrefs;

    // if logged in then get currentUsers preference , else default to false mature toggle
    if (user) {
      const { data: userPrefs } = await supabase
        .from("users_ext")
        .select("user_profile_mature_enabled")
        .eq("auth_id", user.id)
        .single();

      maturePrefs = userPrefs;
    } else {
      maturePrefs = {
        user_profile_mature_enabled: false,
      };
    }

    // Get projects that are not completed (i.e., active sessions)
    const { data: projects, error } = await supabase
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
      .eq("is_completed", false)
      // Only show mature content if user has enabled it
      .or(
        maturePrefs?.user_profile_mature_enabled
          ? "is_mature_content.eq.true,is_mature_content.eq.false"
          : "is_mature_content.eq.false"
      );

    if (error) {
      console.error("Error fetching sessions:", error);
      return null;
    }

    if (!projects || projects.length === 0) {
      return [];
    }

    return projects;
  } catch (err) {
    console.error("Exception in getProjects:", err);
    return null;
  }
};

export const getAllStoriesWithProfileName = async (): Promise<
  CompletedStoriesData[] | null
> => {
  try {
    // Get the current user's mature content preference
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: userPrefs } = await supabase
      .from("users_ext")
      .select("user_profile_mature_enabled")
      .eq("auth_id", user.id)
      .single();

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        users_ext:creator_id(
          auth_id,
          user_profile_name
        )
      `
      )
      .eq("is_completed", true)
      // Only show mature content if user has enabled it
      .or(
        userPrefs?.user_profile_mature_enabled
          ? "is_mature_content.eq.true,is_mature_content.eq.false"
          : "is_mature_content.eq.false"
      );

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
  // Define all avatar filenames
  const avatarFilenames = [
    "user_avatar_01.png",
    "user_avatar_02.png",
    "user_avatar_03.png",
    "user_avatar_04.png",
    "user_avatar_05.png",
    "user_avatar_06.png",
    "user_avatar_07.png",
    "user_avatar_08.png",
    "user_avatar_09.png",
    "user_avatar_10.png",
    "user_avatar_11.png",
    "user_avatar_12.png",
    "user_avatar_13.png",
    "user_avatar_14.png",
    "user_avatar_15.png",
    "user_avatar_16.png",
    "user_avatar_17.png",
    "user_avatar_2_1.jpg",
    "user_avatar_2_2.jpg",
    "user_avatar_2_3.jpg",
    "user_avatar_2_4.jpg",
    "user_avatar_2_5.jpg",
    "user_avatar_2_6.jpg",
  ];

  // Generate all public URLs using map
  const avatarUrls = avatarFilenames.map(
    (filename) =>
      supabase.storage.from("user-profile-pictures").getPublicUrl(filename).data
        .publicUrl
  );

  return avatarUrls;
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
  try {
    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("users_ext")
      .select("id, user_profile_name, profile_pic_url, user_email")
      .in("auth_id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }

    // Get instructor status for these users
    const { data: stats, error: statsError } = await supabase
      .from("user_gamification_stats")
      .select("user_id, is_cc_instructor")
      .in("user_id", userIds);

    if (statsError) {
      console.error("Error fetching instructor stats:", statsError);
      return profiles;
    }

    // Create a map of user_id to instructor status
    const instructorMap = new Map(
      stats.map((stat) => [stat.user_id, stat.is_cc_instructor])
    );

    // Combine the data
    return profiles.map((profile) => ({
      ...profile,
      is_instructor: instructorMap.get(profile.id) || false,
    }));
  } catch (error) {
    console.error("Error in getProfilesByUserIdsForPopUp:", error);
    return [];
  }
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
// Optimized version that fetches all data in a single query with joins

export async function getProjectContributors(projectId: string | undefined) {
  try {
    // Use a single query with joins to get all data at once
    const { data: enrichedContributors, error } = await supabase
      .from("project_contributors")
      .select(
        `
        *,
        user:users_ext!user_id(
          id, 
          user_profile_name
        )
      `
      )
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching project contributors:", error);
      return [];
    }

    if (!enrichedContributors || enrichedContributors.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [
      ...new Set(
        enrichedContributors.map((contributor) => contributor.user_id)
      ),
    ];

    // Fetch instructor status for all users at once
    const { data: statsData } = await supabase
      .from("user_gamification_stats")
      .select("user_id, is_cc_instructor")
      .in("user_id", userIds);

    // Create a map of user_id to instructor status
    const instructorMap = new Map();
    if (statsData) {
      statsData.forEach((stat) => {
        instructorMap.set(stat.user_id, !!stat.is_cc_instructor);
      });
    }

    // Process the data to ensure all fields have default values
    return enrichedContributors.map((contributor) => ({
      ...contributor,
      user_made_contribution: contributor.user_made_contribution || false,
      current_writer: contributor.current_writer || false,
      user_is_project_creator: contributor.user_is_project_creator || false,
      last_contribution_at:
        contributor.last_contribution_at ||
        contributor.joined_at ||
        new Date().toISOString(),
      // Extract user from the joined data
      user: contributor.user
        ? {
            ...contributor.user,
            is_instructor: instructorMap.get(contributor.user_id) || false,
          }
        : {
            id: contributor.user_id,
            user_profile_name: "Unknown",
            is_instructor: false,
          },
    }));
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

// Get all user profile data in a single function to reduce API calls
export const getUserProfileData = async (profileId: string): Promise<any> => {
  try {
    if (!profileId) {
      throw new Error("User does not exist");
    }

    // Make parallel API calls for all user data
    const [userExtData, completedProjects, inProgressProjects] =
      await Promise.all([
        // Get user_ext data (contains username, bio, profile pic, mature content settings)
        supabase
          .from("users_ext")
          .select(
            "user_profile_name, user_profile_bio, profile_pic_url, user_profile_mature_enabled, user_email"
          )
          .eq("auth_id", profileId)
          .single(),

        // Get completed projects
        supabase
          .from("projects")
          .select("*")
          .eq("creator_id", profileId)
          .eq("is_completed", true),

        // Get in-progress projects
        supabase
          .from("projects")
          .select("*")
          .eq("creator_id", profileId)
          .eq("is_completed", false),
      ]);

    // Get profile picture options using our optimized function
    const profilePictureOptions = getProfilePictureOptionsSync();

    if (userExtData.error) {
      throw userExtData.error;
    }

    // Format the data for consistent response
    return {
      userData: userExtData.data,
      username: userExtData.data?.user_profile_name,
      email: userExtData.data?.user_email,
      bio: userExtData.data?.user_profile_bio,
      profilePicture: userExtData.data?.profile_pic_url,
      matureContentEnabled: userExtData.data?.user_profile_mature_enabled,
      profilePictureOptions: profilePictureOptions,
      completedProjects: completedProjects.data || [],
      inProgressProjects: inProgressProjects.data || [],
    };
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    throw error;
  }
};

/**
 * Deletes the current user's account after confirmation and handles navigation
 * @returns {Promise<{success: boolean, message: string}>} Result of the deletion attempt
 */
const deleteUserAccount = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // First confirmation
    if (!window.confirm("Are you sure you want to delete your account?")) {
      return { success: false, message: "Account deletion cancelled" };
    }

    // Second confirmation with warning about data loss
    if (
      !window.confirm(
        "WARNING: This action CANNOT be undone. All your data will be permanently deleted. Are you absolutely sure?"
      )
    ) {
      return { success: false, message: "Account deletion cancelled" };
    }

    // Get the user's session token for authentication (this has been fixed in in the RLS policy)
    // previously required a service level session token which is dangerous
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      return {
        success: false,
        message: "No valid session found. Please log in again.",
      };
    }

    // Base URL retrievef from .env file to prevent exposure
    const API_BASE_URL =
      import.meta.env.VITE_SUPABASE_URL || "http://localhost:8080";

    // Make the API call to the backend delete-account endpoint
    // (located in edge functions to prevent direct access)
    const response = await fetch(
      `${API_BASE_URL}/functions/v1/delete-account`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete account");
    }

    // Force sign out the user after successful deletion
    await supabase.auth.signOut();

    // We've successfully deleted account
    return {
      success: true,
      message: "Your account has been successfully deleted",
    };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      message:
        error.message ||
        "An unexpected error occurred while deleting your account",
    };
  }
};

// Non-async version of getProfilePictureOptions to avoid unnecessary API calls in getUserProfileData
const getProfilePictureOptionsSync = () => {
  // Define all avatar filenames
  const avatarFilenames = [
    "user_avatar_01.png",
    "user_avatar_02.png",
    "user_avatar_03.png",
    "user_avatar_04.png",
    "user_avatar_05.png",
    "user_avatar_06.png",
    "user_avatar_07.png",
    "user_avatar_08.png",
    "user_avatar_09.png",
    "user_avatar_10.png",
    "user_avatar_11.png",
    "user_avatar_12.png",
    "user_avatar_13.png",
    "user_avatar_14.png",
    "user_avatar_15.png",
    "user_avatar_16.png",
    "user_avatar_17.png",
    "user_avatar_2_1.jpg",
    "user_avatar_2_2.jpg",
    "user_avatar_2_3.jpg",
    "user_avatar_2_4.jpg",
    "user_avatar_2_5.jpg",
    "user_avatar_2_6.jpg",
    "user_avatar_3_1.png",
    "user_avatar_3_2.png",
    "user_avatar_3_3.png",
    "user_avatar_3_4.png",
    "user_avatar_3_5.png",
    "user_avatar_3_6.png",
  ];

  // Generate all public URLs using map
  return avatarFilenames.map(
    (filename) =>
      supabase.storage.from("user-profile-pictures").getPublicUrl(filename).data
        .publicUrl
  );
};

// Check if a user has the instructor badge
export const getUserIsInstructor = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_gamification_stats")
      .select("is_cc_instructor")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    return !!data.is_cc_instructor;
  } catch (error) {
    return false;
  }
};

export {
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  deleteUserAccount,
  // getProjectsInprogress,
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
