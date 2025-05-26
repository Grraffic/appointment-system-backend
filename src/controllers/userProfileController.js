const User = require("../models/adminSideSchema/loginSchema/userSchema");
const fs = require("fs").promises;
const path = require("path");

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      try {
        await fs.unlink(path.join(__dirname, "../../", user.profilePicture));
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    // Update user profile picture path in database
    const profilePicturePath = req.file.path.replace(/\\/g, "/"); // Convert Windows path to URL format
    user.profilePicture = profilePicturePath;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: `${req.protocol}://${req.get(
        "host"
      )}/${profilePicturePath}`,
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

    // Convert profile picture path to full URL if it exists
    const profile = user.toObject();
    if (profile.profilePicture) {
      profile.profilePicture = `${req.protocol}://${req.get("host")}/${
        profile.profilePicture
      }`;
    }

    res.status(200).json(profile);
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
    const updateData = { ...req.body };
    delete updateData.password; // Prevent password update through this endpoint

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ message: "Error updating user profile", error: error.message });
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

    if (!user.profilePicture) {
      return res.status(400).json({ message: "No profile picture to delete" });
    }

    // Delete the file
    try {
      await fs.unlink(path.join(__dirname, "../../", user.profilePicture));
    } catch (error) {
      console.error("Error deleting profile picture file:", error);
    }

    // Remove profile picture path from user document
    user.profilePicture = undefined;
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
