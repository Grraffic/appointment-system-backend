const Student = require("../../models/appointmentSchema/studentSchema");
const Attachment = require("../../models/appointmentSchema/attachmentSchema");

// Upload new attachments
exports.uploadAttachments = async (req, res) => {
  try {
    console.log("Full request:", {
      body: req.body,
      files: req.files,
      headers: req.headers,
    });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Log the raw form data
    console.log("Form data body:", req.body);
    console.log("Student ID from form:", req.body.studentId);

    const studentId = req.body.studentId;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    console.log("Processing files for student:", studentId);

    const files = req.files.map((file) => ({
      student: studentId,
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    console.log("Processed files:", files);

    const newAttachment = new Attachment({ files });
    await newAttachment.save();

    console.log("Attachment saved successfully:", newAttachment);

    res.status(201).json({
      message: "Files uploaded successfully",
      data: newAttachment,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading attachments", error });
  }
};

// Get all attachments
exports.getAllAttachments = async (req, res) => {
  try {
    const attachments = await Attachment.find().populate(
      "files.student",
      "name email"
    );
    res.status(200).json({ data: attachments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching attachments", error });
  }
};

// Get attachment by ID
exports.getAttachmentById = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id).populate(
      "files.student"
    );
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }
    res.status(200).json({ data: attachment });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving attachment", error });
  }
};

// Delete attachment by ID
exports.deleteAttachmentById = async (req, res) => {
  try {
    const attachment = await Attachment.findByIdAndDelete(req.params.id);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }
    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting attachment", error });
  }
};
