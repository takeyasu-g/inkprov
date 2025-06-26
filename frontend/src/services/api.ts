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
