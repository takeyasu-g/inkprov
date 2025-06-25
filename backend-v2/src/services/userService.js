import { supabase } from "../config/supabase.js";

/**
 * Fetches basic user profile information from the users_ext table.
 * @param {string} userId - The auth_id of the user.
 * @returns {Promise<object>} An object containing the user's profile name, bio, picture URL, and email.
 */
export const getBasicProfile = async (userId) => {
  // Select only the essential fields for a basic profile view.
  const { data, error } = await supabase
    .from("users_ext")
    .select(
      "user_profile_name, user_profile_bio, profile_pic_url, user_profile_mature_enabled, user_email"
    )
    .eq("auth_id", userId)
    .single(); // .single() ensures we get one object, not an array.

  if (error) {
    console.error("Error in getBasicProfile service:", error);
    // For now, we'll throw a generic error. We can improve this later.
    throw new Error("User profile not found or database error.");
  }

  return data;
};
