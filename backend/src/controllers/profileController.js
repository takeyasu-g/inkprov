import { getUserProfileData } from "../utils/supabase.js";

/**
 * Get a user's complete profile data
 * This combines multiple Supabase queries into a single API endpoint
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get all profile data in a single function call
    const profileData = await getUserProfileData(userId);

    // Format username for display
    let formattedUsername = "";
    if (profileData.username) {
      const usernameParts = profileData.username.split("@")[0];
      formattedUsername =
        usernameParts[0].toUpperCase() + usernameParts.substring(1);
    }

    // Return formatted data
    return res.status(200).json({
      success: true,
      data: {
        ...profileData,
        formattedUsername,
      },
    });
  } catch (error) {
    console.error("Error in getProfile controller:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile data",
      error: error.message,
    });
  }
};
