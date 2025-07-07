import { Router } from "express";
import { getPopularProjectsController } from "../controllers/projectController.js";

const router = Router();

// Add a test route
router.get("/test", (req, res) => {
  res.json({ message: "Project routes are working!" });
});

// Get popular/recent completed projects (public endpoint, no auth required)
// Auth user ID will be used for mature content filtering if available
router.get("/popular", getPopularProjectsController);

export default router; 