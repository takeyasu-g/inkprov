import { supabase } from "@/utils/supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const getProfile = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }

  return response.json();
};

/**
 * Updates a user's profile information via the secure backend API.
 * @param userId The ID of the user whose profile to update
 * @param data The profile data to update (username and/or bio)
 * @returns The updated profile data
 */
/*
export const updateProfile = async (
  userId: string,
  data: { username?: string; bio?: string }
) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("You must be logged in to update your profile.");
  }

  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
};
*/

/**
 * Fetches sessions where the current user can contribute
 * @returns Promise<ProjectsData[]> Array of sessions where user can contribute
 */
export const getUserContributableSessions = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("You must be logged in to view your contributable sessions.");
  }

  const response = await fetch(`${API_BASE_URL}/sessions/contributable`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch contributable sessions");
  }

  const data = await response.json();
  
  // Transform the data to match the expected ProjectsData interface
  return data.map((session: any) => ({
    id: session.id,
    title: session.title,
    description: session.description,
    project_genre: session.project_genre,
    is_completed: session.is_completed,
    creator_id: session.creator_id,
    creator: {
      auth_id: session.creator_auth_id,
      user_profile_name: session.creator_name,
    },
    created_at: session.created_at,
    contributor_count: session.current_contributors_count,
    max_snippets: session.max_snippets,
    updated_at: session.updated_at,
    is_public: session.is_public,
    is_mature_content: session.is_mature_content,
    word_count: 0, // Will be calculated if needed
    current_snippets: session.current_snippets,
    // Add lock information
    is_locked: session.is_locked,
    locked_by: session.locked_by,
    locked_at: session.locked_at,
  }));
};

/**
 * Fetches sessions that the user can join (not a contributor yet)
 * @returns Promise<ProjectsData[]> Array of joinable sessions
 */
export const getJoinableSessions = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("You must be logged in to view joinable sessions.");
  }

  const response = await fetch(`${API_BASE_URL}/sessions/joinable`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch joinable sessions");
  }

  const data = await response.json();
  
  // Transform the data to match the expected ProjectsData interface
  return data.map((session: any) => ({
    id: session.id,
    title: session.title,
    description: session.description,
    project_genre: session.project_genre,
    is_completed: session.is_completed,
    creator_id: session.creator_id,
    creator: {
      auth_id: session.creator_auth_id,
      user_profile_name: session.creator_name,
    },
    created_at: session.created_at,
    contributor_count: session.current_contributors_count,
    max_snippets: session.max_snippets,
    updated_at: session.updated_at,
    is_public: session.is_public,
    is_mature_content: session.is_mature_content,
    word_count: 0, // Will be calculated if needed
    current_snippets: session.current_snippets,
    // Add lock information
    is_locked: session.is_locked,
    locked_by: session.locked_by,
    locked_at: session.locked_at,
  }));
};

/**
 * Fetches all active sessions (public endpoint)
 * @returns Promise<ProjectsData[]> Array of active sessions
 */
export const getAllActiveSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/sessions/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch active sessions");
  }

  return response.json();
};

export const getMyProfile = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("You must be logged in to view your profile.");
  }

  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }

  return response.json();
};

export const updateMyProfile = async (data: { username?: string; bio?: string }) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("You must be logged in to update your profile.");
  }

  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
};
