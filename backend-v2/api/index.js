import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import profileRoutes from "../src/routes/profileRoutes.js";
import sessionRoutes from "../src/routes/sessionRoutes.js";
import projectRoutes from "../src/routes/projectRoutes.js";

// Load environment variables from a .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
// Enable CORS for specific origins
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://inkprov-frontend.vercel.app",
        "http://localhost:5173",
        "https://inkprov-frontend-git-fix-vercel-spa-f98aab-takeyasu-gs-projects.vercel.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Allow our server to understand JSON sent in request bodies
app.use(express.json());

// --- API Routes ---

// Step 2: Use the new profileRoutes with a more accurate path
app.use("/api/profile", profileRoutes);

// Session routes
app.use("/api/sessions", sessionRoutes);

// Project routes
app.use("/api/projects", projectRoutes);

// A simple test route to make sure everything is working
app.get("/api", (req, res) => {
  res.status(200).json({ message: "Welcome to the Inkprov Backend V2!" });
});

// --- End of API Routes ---

// This part is for LOCAL development only.
// It starts a server on your computer so you can test your code.
// Vercel will ignore this and use its own magic to run the app.
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `Server is running for local development on http://localhost:${PORT}`
    );
  });
}

// This makes the 'app' available for Vercel to use
export default app;
