import { Router } from "express";
import {
  getProfileData,
  updateProfileData,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// This route is for fetching the complete, aggregated profile data for a user.
// It is PUBLIC, so anyone can view a user's profile
// URL BASE/api/profile/:userId
router.get("/:userId", getProfileData);

// This route is for updating a user's profile information (e.g., username, bio).
// It is PROTECTED, so only the authenticated user can update their own profile.
router.put("/:userId", authMiddleware, updateProfileData);

export default router;
