import { supabase } from "../config/supabase.js";

/**
 * Fetches sessions where the current user can contribute (is a contributor and can write now)
 * Uses a single RPC call for maximum efficiency
 * @param {string} userId - The auth_id of the user
 * @returns {Promise<Array>} Array of sessions where user can contribute
 */
export const getUserContributableSessions = async (userId) => {
  try {
    // Single RPC call that handles all the logic in PostgreSQL
    const { data, error } = await supabase.rpc("get_user_contributable_sessions", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error in getUserContributableSessions service:", error);
      throw new Error("Could not fetch user contributable sessions.");
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getUserContributableSessions:", error);
    throw error;
  }
};

/**
 * Fetches sessions that the user can join (not a contributor yet)
 * Uses a single RPC call for maximum efficiency
 * @param {string} userId - The auth_id of the user (optional, for mature content filtering)
 * @returns {Promise<Array>} Array of joinable sessions
 */
export const getJoinableSessions = async (userId = null) => {
  try {
    // Single RPC call that handles all the logic in PostgreSQL
    const { data, error } = await supabase.rpc("get_joinable_sessions", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error in getJoinableSessions service:", error);
      throw new Error("Could not fetch joinable sessions.");
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getJoinableSessions:", error);
    throw error;
  }
}; 