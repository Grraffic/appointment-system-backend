const Student = require("../../models/appointmentSchema/studentSchema");
const Attachment = require("../../models/appointmentSchema/attachmentSchema");
const { cloudinary } = require("../../config/cloudinary");

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

    let studentId = req.body.studentId;

    // If studentId is undefined, try to resolve it from the most recent student record
    if (!studentId || studentId === "undefined") {
      console.log(
        "Student ID is undefined, attempting to resolve from recent records..."
      );

      try {
        // Get the most recent student record (assuming it's the current user)
        const recentStudent = await Student.findOne().sort({ _id: -1 });
        if (recentStudent) {
          studentId = recentStudent._id.toString();
          console.log("Resolved student ID from recent record:", studentId);
        } else {
          console.error("No student records found to resolve student ID");
          return res.status(400).json({
            message:
              "Student ID is required and could not be resolved. Please complete the previous steps first.",
          });
        }
      } catch (resolveError) {
        console.error("Error resolving student ID:", resolveError);
        return res.status(400).json({
          message: "Student ID is required and could not be resolved",
        });
      }
    }

    // Validate that the student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    console.log(
      "Processing files for student:",
      studentId,
      "Transaction:",
      student.transactionNumber
    );

    // Process files and re-upload to Cloudinary with correct student ID
    const processedFiles = [];

    for (const file of req.files) {
      console.log("🔍 DEBUG: Processing file from multer:", {
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename,
        fieldname: file.fieldname,
      });

      let finalUrl = file.path;

      console.log("🔍 DEBUG: Initial finalUrl:", finalUrl);
      console.log(
        "🔍 DEBUG: Is Cloudinary URL?",
        finalUrl && finalUrl.includes("cloudinary.com")
      );

      // If file.path doesn't contain a full Cloudinary URL, it means multer-cloudinary didn't work
      // Let's check and fix this like the profile image does
      if (!finalUrl || !finalUrl.includes("cloudinary.com")) {
        console.log(
          "⚠️ Cloudinary URL not found in file.path, using manual upload approach..."
        );

        try {
          // Manual upload to Cloudinary (like profile image does)
          const originalName = file.originalname
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, "_");
          const timestamp = Date.now();
          const publicId = `${originalName}-${studentId}-${timestamp}`;

          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "appointment-system/attachments",
                  public_id: publicId,
                  resource_type: "auto",
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(file.buffer || require("fs").readFileSync(file.path));
          });

          finalUrl = uploadResult.secure_url;
          console.log("✅ Manual upload successful:", finalUrl);
        } catch (uploadError) {
          console.error("❌ Manual upload failed:", uploadError);
          // Keep the original path as fallback
          finalUrl = file.path || file.originalname;
        }
      }

      // If the file path contains "undefined" in the student ID, re-upload with correct ID
      if (file.path && file.path.includes("-undefined-")) {
        console.log(
          "File contains undefined student ID, re-uploading with correct ID..."
        );

        try {
          // Delete the incorrectly named file from Cloudinary
          const publicIdMatch = file.path.match(/\/([^\/]+)\.[^.]+$/);
          if (publicIdMatch) {
            const incorrectPublicId = `appointment-system/attachments/${publicIdMatch[1]}`;
            console.log("Deleting incorrect file:", incorrectPublicId);
            try {
              await cloudinary.uploader.destroy(incorrectPublicId);
            } catch (deleteError) {
              console.warn(
                "Could not delete incorrect file:",
                deleteError.message
              );
            }
          }

          // Re-upload with correct student ID
          const originalName = file.originalname
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, "_");
          const timestamp = Date.now();
          const correctPublicId = `${originalName}-${studentId}-${timestamp}`;

          // Upload the file buffer to Cloudinary with correct naming
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "appointment-system/attachments",
                  public_id: correctPublicId,
                  resource_type: "auto",
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(file.buffer || require("fs").readFileSync(file.path));
          });

          finalUrl = uploadResult.secure_url;
          console.log("Re-uploaded file with correct URL:", finalUrl);
        } catch (reuploadError) {
          console.error("Error re-uploading file:", reuploadError);
          // Keep the original URL if re-upload fails
          finalUrl = file.path;
        }
      }

      // Ensure we always save the full Cloudinary URL
      let fullCloudinaryUrl = finalUrl;

      // If finalUrl is not a full URL, construct it
      if (
        !fullCloudinaryUrl ||
        !fullCloudinaryUrl.startsWith("https://res.cloudinary.com")
      ) {
        console.log(
          "⚠️ finalUrl is not a full Cloudinary URL, constructing it..."
        );

        // If we have a public_id, construct the full URL
        if (finalUrl) {
          // Remove file extension to get clean public_id
          const publicId = finalUrl.replace(/\.[^/.]+$/, "");

          // Extract timestamp for version
          const timestampMatch = publicId.match(/-(\d+)$/);
          const versionTimestamp = timestampMatch
            ? timestampMatch[1].substring(0, 10)
            : Date.now().toString().substring(0, 10);

          fullCloudinaryUrl = `https://res.cloudinary.com/dp9hjzio8/image/upload/v${versionTimestamp}/appointment-system/attachments/${publicId}`;

          console.log("🔍 DEBUG: Constructed full URL from public_id:", {
            originalPath: finalUrl,
            publicId: publicId,
            versionTimestamp: versionTimestamp,
            fullCloudinaryUrl: fullCloudinaryUrl,
          });
        }
      }

      const fileData = {
        student: studentId,
        filename: file.originalname,
        path: fullCloudinaryUrl, // Always save the full Cloudinary URL
        mimetype: file.mimetype,
        size: file.size,
      };

      console.log("🔍 DEBUG: File data being saved to database:", fileData);

      processedFiles.push(fileData);
    }

    console.log("🔍 DEBUG: All processed files with URLs:", processedFiles);

    const newAttachment = new Attachment({ files: processedFiles });
    await newAttachment.save();

    console.log("Attachment saved successfully:", newAttachment);

    res.status(201).json({
      message: "Files uploaded successfully",
      data: newAttachment,
      studentInfo: {
        id: student._id,
        transactionNumber: student.transactionNumber,
        name: `${student.firstName} ${student.surname}`,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res
      .status(500)
      .json({ message: "Error uploading attachments", error: error.message });
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
