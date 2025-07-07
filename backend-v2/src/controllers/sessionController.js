import {
  getUserContributableSessions,
  getJoinableSessions,
} from "../services/sessionService.js";

/**
 * Handles the request for sessions where the current user can contribute
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 */
export const getUserContributableSessionsController = async (req, res) => {
  const authenticatedUserId = req.user?.id; // From authMiddleware

  if (!authenticatedUserId) {
    return res.status(401).json({ 
      message: "Unauthorized: You must be logged in to view your contributable sessions." 
    });
  }

  try {
    const sessions = await getUserContributableSessions(authenticatedUserId);
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error in getUserContributableSessionsController:", error);
    res.status(500).json({ 
      message: error.message || "An internal server error occurred." 
    });
  }
};

/**
 * Handles the request for sessions that the user can join (not a contributor yet)
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 */
export const getJoinableSessionsController = async (req, res) => {
  const authenticatedUserId = req.user?.id;
  
  console.log("=== DEBUG INFO ===");
  console.log("req.user:", req.user);
  console.log("authenticatedUserId:", authenticatedUserId);
  console.log("typeof authenticatedUserId:", typeof authenticatedUserId);
  console.log("==================");
  
  try {
    const sessions = await getJoinableSessions(authenticatedUserId);
    console.log("Sessions returned:", sessions);
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error in getJoinableSessionsController:", error);
    res.status(500).json({ 
      message: error.message || "An internal server error occurred." 
    });
  }
}; 