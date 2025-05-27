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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Increase payload size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
