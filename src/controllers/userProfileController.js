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

    let profilePictureUrl;
    let publicId;

    // Check if we're using Cloudinary or fallback
    if (req.file.path && req.file.path.includes("cloudinary.com")) {

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

      profilePictureUrl = req.file.path;
      publicId = req.file.filename;
    } else {
      // Fallback: Upload to Cloudinary manually
      console.log("⚠️  Using manual Cloudinary upload fallback");

      try {
        // Delete old profile picture if it exists
        if (user.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        }

        // Upload buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "appointment-system/profile-pictures",
                public_id: `profile-${userId}-${Date.now()}`,
                transformation: [
                  { width: 400, height: 400, crop: "fill", quality: "auto" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(req.file.buffer);
        });

        profilePictureUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError);
        return res.status(500).json({
          message: "Failed to upload to Cloudinary",
          error: cloudinaryError.message,
        });
      }
    }

    // Update user profile picture URL and public ID in database
    user.profilePicture = profilePictureUrl;
    user.cloudinaryPublicId = publicId;
    await user.save();
    
    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: profilePictureUrl,
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

    console.log("🗑️ Cloudinary deletion result:", result);

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
