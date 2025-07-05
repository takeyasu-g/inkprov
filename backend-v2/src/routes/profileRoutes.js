import { Router } from "express";
import {
  getProfileData,
  updateProfileData,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Add routes for the authenticated user's own profile.
// These MUST come before the /:userId route to be matched correctly.
router.get("/me", authMiddleware, getProfileData);
router.put("/me", authMiddleware, updateProfileData);

// This route is for fetching the complete, aggregated profile data for any user.
// It is PUBLIC, so anyone can view a user's profile.
// URL: /api/profile/:userId
router.get("/:userId", getProfileData);

export default router;
