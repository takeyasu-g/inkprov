import { Router } from "express";
import { getProfileData } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// This route is for fetching the complete, aggregated profile data for a user.
// It is PUBLIC, so anyone can view a user's profile
router.get("/:userId", getProfileData);

export default router;
