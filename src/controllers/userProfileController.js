const User = require("../models/adminSideSchema/loginSchema/userSchema");
const { cloudinary } = require("../config/cloudinary");
const bcrypt = require("bcrypt"); // Make sure bcrypt is imported

const SALT_ROUNDS = 12;
// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old image from Cloudinary if it exists
    if (user.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        console.log("Old image deleted successfully");
      } catch (err) {
        console.error("Old image deletion failed:", err);
      }
    }

    // Get the Cloudinary URL from the uploaded file
    console.log("File uploaded to Cloudinary:", req.file);
    const imageUrl = req.file.path; // Cloudinary URL
    const publicId = req.file.filename; // Cloudinary public ID

    // Update user with new image details
    user.profilePicture = imageUrl;
    user.cloudinaryPublicId = publicId;
    await user.save();

    console.log("Profile picture updated:", {
      imageUrl,
      publicId,
      userId
    });

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: imageUrl,
      cloudinaryPublicId: publicId
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, password } = req.body;

    // Authorization Check (Important Security Step)
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot update this profile." });
    }

    // First find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;

    // Handle password update
    if (password && password.trim() !== "") {
      console.log(`[API] Updating password for user ${userId}`);
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);
      user.password = hashedPassword;
      console.log(`[API] Password hashed and updated for user ${userId}`);
    }

    // Save the user document
    await user.save();

    // Get the updated user without the password field
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    // Handle specific errors like duplicate email
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "This email address is already in use." });
    }
    res.status(500).json({ message: "Server error during profile update." });
  }
};
// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cloudinaryPublicId) {
      return res.status(400).json({ message: "No profile picture to delete" });
    }

    await cloudinary.uploader.destroy(user.cloudinaryPublicId);

    user.profilePicture = undefined;
    user.cloudinaryPublicId = undefined;
    await user.save();

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({
      message: "Error deleting profile picture",
      error: error.message,
    });
  }
};

// Delete specific image from Cloudinary by public ID (admin function)
exports.deleteImageByPublicId = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: "Public ID is required" });
    }

    console.log("🗑️ Attempting to delete image with public ID:", publicId);

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);


    if (result.result === "ok") {
      res.status(200).json({
        message: "Image deleted successfully from Cloudinary",
        result: result,
      });
    } else if (result.result === "not found") {
      res.status(404).json({
        message: "Image not found in Cloudinary",
        result: result,
      });
    } else {
      res.status(400).json({
        message: "Failed to delete image",
        result: result,
      });
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    res.status(500).json({
      message: "Error deleting image from Cloudinary",
      error: error.message,
    });
  }
};
