import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a Supabase client with the service role key for backend operations
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create a Supabase client with the service role key (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Gets all profile data for a user in a single request
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The user's profile data
 */
export const getUserProfileData = async (userId) => {
  try {
    // Make parallel requests for all user data
    const [
      userData,
      bioData,
      profilePicture,
      profilePictureOptions,
      completedProjects,
      inProgressProjects,
    ] = await Promise.all([
      // Get username
      supabase
        .from("users_ext")
        .select("user_profile_name")
        .eq("auth_id", userId)
        .single(),

      // Get bio
      supabase
        .from("users_ext")
        .select("user_profile_bio")
        .eq("auth_id", userId)
        .single(),

      // Get profile picture
      supabase
        .from("users_ext")
        .select("profile_pic_url")
        .eq("auth_id", userId)
        .single(),

      // Get profile picture options
      getProfilePictureOptions(),

      // Get completed projects
      supabase
        .from("projects")
        .select("*")
        .eq("creator_id", userId)
        .eq("is_completed", true),

      // Get in-progress projects
      supabase
        .from("projects")
        .select("*")
        .eq("creator_id", userId)
        .eq("is_completed", false),
    ]);

    // Format data for consistent response
    return {
      username: userData.data?.user_profile_name || "",
      bio: bioData.data?.user_profile_bio || "",
      profilePicture: profilePicture.data?.profile_pic_url || "",
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
 * Gets profile picture options
 * @returns {Promise<Array>} - List of profile picture URLs
 */
const getProfilePictureOptions = async () => {
  try {
    // Define all avatar filenames - this is a simplified example
    const avatarFilenames = [
      "user_avatar_1.png",
      "user_avatar_2.png",
      "user_avatar_3.png",
      "user_avatar_4.png",
      "user_avatar_5.png",
      "user_avatar_6.png",
      "user_avatar_7.png",
      "user_avatar_8.png",
    ];

    // Generate all public URLs in one go
    return avatarFilenames.map(
      (filename) =>
        supabase.storage.from("user-profile-pictures").getPublicUrl(filename)
          .data.publicUrl
    );
  } catch (error) {
    console.error("Error fetching profile picture options:", error);
    return [];
  }
};
