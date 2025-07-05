import {
  getBasicProfile,
  getProfilePictureOptions,
  updateUserProfile,
} from "../services/userService.js";
import { getUserProjectsWithStats } from "../services/projectService.js";
import { getUserStats } from "../services/gamificationService.js";

/**
 * Handles the request for a complete user profile by aggregating data
 * from multiple services. This is a composite endpoint for efficiency.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const getProfileData = async (req, res) => {
  // Use req.user.id if no userId param (for /me route)
  const userId = req.params.userId || (req.user && req.user.id);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Use Promise.all to fetch all data in parallel for maximum efficiency.
    // This is much faster than awaiting each call individually.
    const [profile, projects, stats, pictureOptions] = await Promise.all([
      getBasicProfile(userId),
      getUserProjectsWithStats(userId),
      getUserStats(userId),
      getProfilePictureOptions(), // Fetch the avatar options
    ]);

    // Assemble the final, clean JSON response for the frontend
    const profileData = {
      profile, // Basic user info from userService
      projects, // Projects with stats from projectService
      stats, // Gamification stats from gamificationService
      pictureOptions, // Available avatar choices
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error in getProfileData controller:", error);
    res
      .status(500)
      .json({ message: error.message || "An internal server error occurred." });
  }
};

/**
 * Handles updating a user's profile information (username and bio).
 * This is a protected action requiring authentication and authorization.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const updateProfileData = async (req, res) => {
  // Use req.user.id if no userId param (for /me route)
  const userId = req.params.userId || (req.user && req.user.id);
  const { username, bio } = req.body;
  const authenticatedUserId = req.user.id; // From authMiddleware

  // Authorization Check: Ensure the logged-in user is updating their own profile.
  if (userId !== authenticatedUserId) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only update your own profile." });
  }

  try {
    // Build the update object cleanly, only including fields that were provided.
    const updateData = {
      ...(username !== undefined && { user_profile_name: username }),
      ...(bio !== undefined && { user_profile_bio: bio }),
    };

    // Only proceed if there is data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }

    const updatedProfile = await updateUserProfile(userId, updateData);
    res.status(200).json({
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error in updateProfileData controller:", error);
    res
      .status(500)
      .json({ message: error.message || "An internal server error occurred." });
  }
};
