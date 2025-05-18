// const Attachment = require("../../models/appointmentSchema/attachmentSchema");
// const Student = require("../../models/appointmentSchema/studentSchema");

// // Upload new attachments
// exports.uploadAttachments = async (req, res) => {
//   try {
//     const files = req.files.map((file) => ({
//       student: req.body.studentId,
//       filename: file.originalname,
//       path: file.path,
//       mimetype: file.mimetype,
//       size: file.size,
//     }));

//     const newAttachment = new Attachment({ files });

//     await newAttachment.save();
//     res
//       .status(201)
//       .json({ message: "Files uploaded successfully", data: newAttachment });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ message: "Error uploading attachments", error });
//   }
// };

// // Get all attachments
// exports.getAllAttachments = async (req, res) => {
//   try {
//     const attachments = await Attachment.find().populate(
//       "files.student",
//       "name email"
//     ); // assuming Student has name/email
//     res.status(200).json({ data: attachments });
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     res.status(500).json({ message: "Error fetching attachments", error });
//   }
// };

// // Get attachment by ID
// exports.getAttachmentById = async (req, res) => {
//   try {
//     const attachment = await Attachment.findById(req.params.id).populate(
//       "files.student"
//     );
//     if (!attachment) {
//       return res.status(404).json({ message: "Attachment not found" });
//     }
//     res.status(200).json({ data: attachment });
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     res.status(500).json({ message: "Error retrieving attachment", error });
//   }
// };

// // Delete attachment by ID
// exports.deleteAttachmentById = async (req, res) => {
//   try {
//     const attachment = await Attachment.findByIdAndDelete(req.params.id);
//     if (!attachment) {
//       return res.status(404).json({ message: "Attachment not found" });
//     }
//     res.status(200).json({ message: "Attachment deleted successfully" });
//   } catch (error) {
//     console.error("Delete Error:", error);
//     res.status(500).json({ message: "Error deleting attachment", error });
//   }
// };

const Attachment = require("../../models/appointmentSchema/attachmentSchema");

exports.uploadAttachments = async (req, res) => {
  try {
    const files = req.files.map((file) => ({
      student: req.body.studentId,
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const newAttachment = new Attachment({ files });
    await newAttachment.save();

    res
      .status(201)
      .json({ message: "Files uploaded successfully", data: newAttachment });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading attachments", error });
  }
};

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

exports.getAttachmentById = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id).populate(
      "files.student"
    );
    if (!attachment)
      return res.status(404).json({ message: "Attachment not found" });
    res.status(200).json({ data: attachment });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving attachment", error });
  }
};

exports.deleteAttachmentById = async (req, res) => {
  try {
    const attachment = await Attachment.findByIdAndDelete(req.params.id);
    if (!attachment)
      return res.status(404).json({ message: "Attachment not found" });
    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting attachment", error });
  }
};
