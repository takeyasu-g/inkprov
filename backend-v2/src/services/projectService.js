import { supabase } from "../config/supabase.js";

/**
 * Fetches all projects a specific user is a contributor to, including calculated stats.
 * This function calls a custom database function (RPC) for high performance.
 * @param {string} userId - The auth_id of the user.
 * @returns {Promise<Array>} An array of project objects with contributor and word counts.
 */
export const getUserProjectsWithStats = async (userId) => {
  // 1. Call the RPC function by its name.
  // 2. Pass the arguments as an object. The key 'p_user_id' must match the argument name in our SQL function.
  const { data, error } = await supabase.rpc("get_user_projects_with_stats", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error in getUserProjectsWithStats service:", error);
    throw new Error("Could not fetch user's projects with stats.");
  }

  // 3. The data comes back perfectly formatted from the database function. No extra mapping needed.
  return data;
};
