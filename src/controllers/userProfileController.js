const User = require("../models/adminSideSchema/loginSchema/userSchema");
const { cloudinary } = require("../config/cloudinary");

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

    // Delete old profile picture from Cloudinary if it exists
    if (user.profilePicture && user.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(user.cloudinaryPublicId);
      } catch (error) {
        console.error(
          "Error deleting old profile picture from Cloudinary:",
          error
        );
      }
    }

    // Update user profile picture URL and public ID in database
    user.profilePicture = req.file.path; // Cloudinary URL
    user.cloudinaryPublicId = req.file.filename; // Cloudinary public ID
    await user.save();

    console.log("✅ Profile picture upload successful:");
    console.log("- File path (Cloudinary URL):", req.file.path);
    console.log("- Public ID:", req.file.filename);
    console.log("- User ID:", userId);

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: req.file.path, // Return Cloudinary URL
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

    // Return user profile with Cloudinary URL (no need to modify)
    const profile = user.toObject();
    // profilePicture already contains the full Cloudinary URL

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

    // Delete the file from Cloudinary
    if (user.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(user.cloudinaryPublicId);
      } catch (error) {
        console.error("Error deleting profile picture from Cloudinary:", error);
      }
    }

    // Remove profile picture path and public ID from user document
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
