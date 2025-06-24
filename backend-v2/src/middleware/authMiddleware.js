import { supabase } from "../config/supabase.js";

/**
 * Middleware to verify the user's JWT token from the Authorization header.
 * If the token is valid, it attaches the user object to the request (req.user).
 * If not, it sends a 401 Unauthorized error.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authentication token is required." });
  }

  const token = authHeader.split(" ")[1];

  // Ask Supabase to verify the token
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    // This can happen if the token is expired, invalid, or belongs to a non-existent user
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  // Success! Attach the verified user to the request object
  req.user = user;

  // Pass control to the next function in the chain (the actual controller)
  next();
};

export default authMiddleware;
