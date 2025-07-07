import { getPopularProjects } from "../services/projectService.js";

/**
 * Handles the request for popular/recent completed projects
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 */
export const getPopularProjectsController = async (req, res) => {
  const authenticatedUserId = req.user?.id; // May be null for guests
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  
  try {
    const projects = await getPopularProjects(authenticatedUserId, limit);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error in getPopularProjectsController:", error);
    res.status(500).json({ 
      message: error.message || "An internal server error occurred." 
    });
  }
}; 