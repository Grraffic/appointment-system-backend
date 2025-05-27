const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profile-pictures";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Import controller functions (we'll create these next)
const {
  uploadProfilePicture,
  getUserProfile,
  updateUserProfile,
  deleteProfilePicture,
} = require("../controllers/userProfileController");

// Profile picture routes
router.post(
  "/:userId/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/:userId/profile-picture", authMiddleware, deleteProfilePicture);

// User profile routes
router.get("/:userId", authMiddleware, getUserProfile);
router.put("/:userId", authMiddleware, updateUserProfile);

module.exports = router;
