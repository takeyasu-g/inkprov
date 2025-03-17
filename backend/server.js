import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for parsing JSON
app.use(express.json());

// Display the files built from vite
app.use(express.static(path.join("../frontend/dist")));

// Handle all routes by sending the index.html file
// This enables client-side routing to work on page refresh
app.get("*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "../frontend/dist/index.html"));
});

app.listen(PORT);
