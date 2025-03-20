import express from "express";
import { getProfile } from "../controllers/profileController.js";

const router = express.Router();

/**
 * @route   GET /api/profile/:userId
 * @desc    Get user profile data
 * @access  Public
 */
router.get("/:userId", getProfile);

export default router;
