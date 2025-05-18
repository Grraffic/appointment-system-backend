const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  uploadAttachments,
  getAllAttachments,
  getAttachmentById,
  deleteAttachmentById,
} = require("../../controllers/appointmentController/attachment.Controller");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/upload", upload.array("files", 10), uploadAttachments);
router.get("/", getAllAttachments);
router.get("/:id", getAttachmentById);
router.delete("/:id", deleteAttachmentById);

module.exports = router;
