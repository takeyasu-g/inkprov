import { supabase } from "../config/supabase.js";

/**
 * Fetches a user's core gamification statistics.
 * @param {string} userId - The auth_id of the user.
 * @returns {Promise<object>} An object containing the user's stats.
 */
export const getUserStats = async (userId) => {
  const { data, error } = await supabase
    .from("gamification_user_stats")
    .select("*")
    .eq("user_id", userId)
    .single(); // .single() is used because each user has only one row of stats.

  if (error) {
    // It's possible a new user doesn't have a stats row yet.
    // In that case, we don't want to throw an error, but return null or a default object.
    if (error.code === "PGRST116") {
      // PostgREST code for "exact one row not found"
      return null; // Or return a default stats object like { total_likes_received: 0, ... }
    }
    console.error("Error in getUserStats service:", error);
    throw new Error("Could not fetch user statistics.");
  }

  return data;
};
