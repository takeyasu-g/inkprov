import express from "express";
import path from "path";
import "@dotenvx/dotenvx/config";
import cors from "cors";
import getWritingSuggestions from "./aiAgent/aiChat.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Domains that are allowed to make requests
const whitelist = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://www.inkprov.net/",
];

// Only allow requests from the whitelisted domains
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Middleware for parsing JSON
app.use(express.json());

app.use(cors());

// Display the files built from vite
app.use(express.static(path.join("../frontend/dist")));

// Handle all routes by sending the index.html file
// This enables client-side routing to work on page refresh
app.get("*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "../frontend/dist/index.html"));
});

app.post("/ideas", cors(corsOptions), async (req, res) => {
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

app.listen(PORT);
