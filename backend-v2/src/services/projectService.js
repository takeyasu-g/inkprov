import { supabase } from "../config/supabase.js";

/**
 * Fetches all projects a specific user is a contributor to, including calculated stats.
 * This function calls a custom database function (RPC) for high performance.
 * @param {string} userId - The auth_id of the user.
 * @returns {Promise<Object>} An object containing two arrays of project objects: completedProjects and inProgressProjects.
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

  // If no data is returned, provide a default structure.
  if (!data) {
    return { completedProjects: [], inProgressProjects: [] };
  }

  // Categorize projects into completed and in-progress lists.
  const completedProjects = data.filter((p) => p.is_completed);
  const inProgressProjects = data.filter((p) => !p.is_completed);

  // Return the categorized data.
  return { completedProjects, inProgressProjects };
};
