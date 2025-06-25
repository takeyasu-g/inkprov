import {
  getBasicProfile,
  getProfilePictureOptions,
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
  const { userId } = req.params;

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
