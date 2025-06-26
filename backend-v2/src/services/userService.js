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

/**
 * Fetches the list of all available profile picture options from Supabase storage.
 * @returns {Promise<string[]>} A promise that resolves to an array of public URLs for the avatar images.
 */
export const getProfilePictureOptions = async () => {
  const { data: fileList, error: listError } = await supabase.storage
    .from("user-profile-pictures")
    .list();

  if (listError) {
    console.error("Error listing profile pictures:", listError);
    throw new Error("Could not fetch profile picture options.");
  }

  // Map the file list to an array of public URLs
  const options = fileList.map((file) => {
    const { data: publicUrlData } = supabase.storage
      .from("user-profile-pictures")
      .getPublicUrl(file.name);
    return publicUrlData.publicUrl;
  });

  return options;
};

/**
 * Updates the user's profile information in the users_ext table.
 * @param {string} userId - The auth_id of the user.
 * @param {object} updateData - An object containing the updated profile information.
 * @returns {Promise<object>} An object containing the updated user's profile name and bio.
 */
export const updateUserProfile = async (userId, updateData) => {
  const { data, error } = await supabase
    .from("users_ext")
    .update(updateData)
    .eq("auth_id", userId)
    .select("user_profile_name, user_profile_bio")
    .single();

  if (error) {
    console.error("Error in updateUserProfile service:", error);
    // For now, we'll throw a generic error. We can improve this later.
    throw new Error("User profile not found or database error.");
  }

  return data;
};
