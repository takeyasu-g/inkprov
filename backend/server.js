import express from "express";
import path from "path";
import "@dotenvx/dotenvx/config";
import cors from "cors";
import getWritingSuggestions from "./aiAgent/aiChat.js";
import ModeratePromptInput from "./utils/contentModeration.js";
import dotenv from "dotenv";
import profileRoutes from "./src/routes/profileRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Domains that are allowed to make requests
const whitelist = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://www.inkprov.net",
];

// Only allow requests from the whitelisted domains
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Middleware for parsing JSON
app.use(express.json());

// Apply CORS middleware
app.use(cors(corsOptions));

// API Routes - these need to come BEFORE the static file serving
app.use("/api/profile", profileRoutes);

app.post("/ideas", async (req, res) => {
  try {
    if (process.env.AIenabled) {
      const suggestions = await getWritingSuggestions(req.body.prompt);
      res.status(200).send(suggestions);
    } else {
      res.status(200).send("Feature Coming Soon");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// AI Content Moderation API Endpoint
app.post("/moderation", async (req, res) => {
  try {
    const moderationResult = await ModeratePromptInput(req.body.content);
    res.status(200).send(moderationResult);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Static file serving
app.use(express.static(path.join("../frontend/dist")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// This catch-all route should come AFTER all API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "../frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
