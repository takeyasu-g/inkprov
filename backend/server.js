import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for parsing JSON
app.use(express.json());

// Display the files built from vite
app.use(express.static(path.join("../frontend/dist")));

app.listen(PORT);