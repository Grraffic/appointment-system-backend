const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Check if Cloudinary environment variables are set
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ CLOUDINARY CONFIGURATION ERROR:");
  console.error("Missing required environment variables:");
  console.error(
    "- CLOUDINARY_CLOUD_NAME:",
    process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing"
  );
  console.error(
    "- CLOUDINARY_API_KEY:",
    process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing"
  );
  console.error(
    "- CLOUDINARY_API_SECRET:",
    process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing"
  );
  throw new Error(
    "Cloudinary configuration is incomplete. Please set all required environment variables."
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(
  "✅ Cloudinary configured with cloud name:",
  process.env.CLOUDINARY_CLOUD_NAME
);

// Configure Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
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
