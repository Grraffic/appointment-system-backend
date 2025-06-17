const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db"); // Correct path to your db.js
const routes = require("./src/routes");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://appointment-system-hy6r.onrender.com",
      "https://appointment-system-fe.vercel.app",
      "https://appointment-system-backend-n8dk.onrender.com",
      // "https://appointment-system-backend.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
    credentials: true,
  })
);

// Increase payload size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// Debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
    origin: req.get("origin") || "No origin header",
  });
});

// Logger Middleware
app.use((req, res, next) => {
  // console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
