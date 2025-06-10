const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { profilePictureStorage } = require("../config/cloudinary");

// Configure multer with Cloudinary storage
const upload = multer({
  storage: profilePictureStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const {
  uploadProfilePicture,
  getUserProfile,
  updateUserProfile,
  deleteProfilePicture,
  deleteImageByPublicId,
} = require("../controllers/userProfileController");

// Profile picture routes
router.post(
  "/:userId/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/:userId/profile-picture", authMiddleware, deleteProfilePicture);

// Admin route to delete any image by public ID
router.delete("/admin/delete-image", authMiddleware, deleteImageByPublicId);
router.get("/ping", (req, res) => {
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
