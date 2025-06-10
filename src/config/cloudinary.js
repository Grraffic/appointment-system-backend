const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "Missing required environment variables. Using fallback configuration."
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for profile pictures
let profilePictureStorage;

try {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    profilePictureStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "appointment-system/profile-pictures",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [
          { width: 400, height: 400, crop: "fill", quality: "auto" },
        ],
        public_id: (req, file) => {
          const userId = req.params.userId;
          return `profile-${userId}-${Date.now()}`;
        },
      },
    });
  } else {
    // Fallback to memory storage
    const multer = require("multer");
    profilePictureStorage = multer.memoryStorage();
  }
} catch (error) {
  console.error("❌ Error configuring Cloudinary storage:", error);
  // Fallback to memory storage
  const multer = require("multer");
  profilePictureStorage = multer.memoryStorage();
}

// Configure Cloudinary storage for attachments
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "appointment-system/attachments",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    resource_type: "auto", // Automatically detect file type
    public_id: (req, file) => {
      const studentId = req.body.studentId;
      return `attachment-${studentId}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;
    },
  },
});

module.exports = {
  cloudinary,
  profilePictureStorage,
  attachmentStorage,
};
