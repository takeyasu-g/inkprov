import { Router } from "express";
import {
  getUserContributableSessionsController,
  getJoinableSessionsController,
} from "../controllers/sessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Add a test route
router.get("/test", (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "Session routes are working!" });
});

// Get sessions where the current user can contribute (requires authentication)
router.get("/contributable", authMiddleware, getUserContributableSessionsController);

// Get sessions that the user can join (not a contributor yet) - requires authentication
router.get("/joinable", authMiddleware, getJoinableSessionsController);

export default router;