const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { profilePictureStorage } = require("../config/cloudinary");

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: profilePictureStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

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
router.get("/ping", (req, res) => {
  console.log("SUCCESS: Reached the /api/profile/ping route!");
  res.status(200).send("Pong! The profile router is working!");
});

// Debug endpoint to check Cloudinary configuration
router.get("/debug/cloudinary", (req, res) => {
  const config = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing",
    apiKey: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
    apiSecret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
    nodeEnv: process.env.NODE_ENV || "development",
  };

  console.log("🔍 Cloudinary Configuration Check:", config);
  res.status(200).json({
    message: "Cloudinary configuration status",
    config: config,
    timestamp: new Date().toISOString(),
  });
});
// User profile routes
router.get("/:userId", authMiddleware, getUserProfile);
router.put("/:userId", authMiddleware, updateUserProfile);

module.exports = router;
