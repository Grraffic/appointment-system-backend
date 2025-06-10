const express = require("express");
const router = express.Router();
const multer = require("multer");
const { attachmentStorage } = require("../../config/cloudinary");
const {
  uploadAttachments,
  getAllAttachments,
  getAttachmentById,
  deleteAttachmentById,
} = require("../../controllers/appointmentController/attachment.Controller");

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: attachmentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).array("files", 10);

// Error handling middleware
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      });
    } else if (err) {
      // Other error occurred
      return res.status(400).json({
        message: "Error uploading file",
        error: err.message,
      });
    }
    // Everything went fine
    next();
  });
};

router.post("/upload", uploadMiddleware, uploadAttachments);
router.get("/", getAllAttachments);
router.get("/:id", getAttachmentById);
router.delete("/:id", deleteAttachmentById);

module.exports = router;
