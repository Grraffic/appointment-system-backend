const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const routes = require("./src/routes");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());


// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("✅ Created 'uploads/' folder");
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Body:", req.body);
  next();
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
