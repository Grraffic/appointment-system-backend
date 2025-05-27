const DocumentRequest = require("../../models/appointmentSchema/requestSchema");
const Student = require("../../models/appointmentSchema/studentSchema");
const Attachment = require("../../models/appointmentSchema/attachmentSchema");
const { sendDocumentRequestUpdate } = require("../../util/emailService");

// Create Document Request
const createDocumentRequest = async (req, res) => {
  try {
    const { studentId, selectedDocuments, purpose, dateOfRequest } = req.body;

    if (!studentId || !selectedDocuments || !purpose || !dateOfRequest) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the request
    const newRequest = new DocumentRequest({
      student: studentId,
      selectedDocuments,
      purpose,
      dateOfRequest,
    });

    const savedRequest = await newRequest.save();

    // Get student details for notification
    const student = await Student.findById(studentId);
    if (student) {
      try {
        await sendDocumentRequestUpdate(student.emailAddress, {
          name: `${student.firstName} ${student.surname}`,
          requestId: savedRequest._id,
          status: "processing",
          documents: selectedDocuments,
          message:
            "Your document request has been received and is being processed.",
        });
      } catch (emailError) {
        console.warn("Failed to send request notification:", emailError);
        // Continue with success response even if email fails
      }
    }

    res.status(201).json({
      message: "Document request created successfully",
      request: savedRequest,
    });
  } catch (error) {
    console.error("Error creating document request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all document requests
const getDocumentRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find()
      .populate("student", "surname firstName middleName emailAddress")
      .sort({ dateOfRequest: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching document requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get document request by ID
const getDocumentRequestById = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student",
      "surname firstName middleName emailAddress"
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get document request with student details
const getDocumentRequestWithStudent = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student"
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching populated request:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const generateTransactionNumber = () => {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000; // Generate a 6-digit random number
  const randomSuffix = Math.floor(Math.random() * 900) + 100; // Generate a 3-digit random number
  return `TR${randomNumber}-${randomSuffix}`;
};

const getDocumentRequestsWithDetails = async (req, res) => {
  try {
    // Get all requests with student info
    const requests = await DocumentRequest.find()
      .populate("student")
      .sort({ dateOfRequest: -1 });

    // Get all attachments
    const attachments = await Attachment.find();

    // Map requests to include attachment info
    const result = requests.map((req) => {
      try {
        // Skip if no student data
        if (!req.student || !req.student._id) {
          return {
            transactionNumber: generateTransactionNumber(),
            name: 'N/A',
            lastSY: 'N/A',
            program: 'N/A',
            contact: 'N/A',
            email: 'N/A',
            attachment: 'No attachments',
            request: 'No documents selected',
            date: 'N/A'
          };
        }

        // Find attachments for this student
        const studentAttachments = attachments
          .filter(att => att.files && Array.isArray(att.files))
          .flatMap(att => att.files)
          .filter(file => 
            file && 
            file.student && 
            file.student.toString() === req.student._id.toString()
          );

        // Get filenames safely
        const filenames = studentAttachments
          .filter(file => file && file.filename)
          .map(file => file.filename);

        return {
          transactionNumber: generateTransactionNumber(),
          name: req.student ? `${req.student.surname || ''}, ${req.student.firstName || ''} ${req.student.middleName || ''}`.trim() : 'N/A',
          lastSY: req.student?.lastSchoolYearAttended || 'N/A',
          program: req.student?.courseOrStrand || 'N/A',
          contact: req.student?.contactNumber || 'N/A',
          email: req.student?.emailAddress || 'N/A',
          attachment: filenames.length > 0 ? filenames.join(", ") : 'No attachments',
          request: Array.isArray(req.selectedDocuments) ? req.selectedDocuments.join(", ") : 'No documents selected',
          date: req.dateOfRequest ? req.dateOfRequest.toISOString().split("T")[0] : 'N/A',
        };
      } catch (error) {
        console.error("Error processing request:", error);
        // Return a safe default for this request
        return {
          transactionNumber: generateTransactionNumber(),
          name: 'Error processing data',
          lastSY: 'N/A',
          program: 'N/A',
          contact: 'N/A',
          email: 'N/A',
          attachment: 'No attachments',
          request: 'No documents selected',
          date: 'N/A'
        };
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching document requests with details:", error);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};
// Update document request
const updateDocumentRequest = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student",
      "surname firstName middleName emailAddress"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update the request
    Object.assign(request, req.body);
    const updatedRequest = await request.save();

    // Send status update email if status is provided and student email exists
    if (req.body.status && request.student.emailAddress) {
      try {
        await sendDocumentRequestUpdate(request.student.emailAddress, {
          name: `${request.student.firstName} ${request.student.surname}`,
          requestId: request._id,
          status: req.body.status,
          documents: request.selectedDocuments,
          pickupDate: req.body.pickupDate,
          message: req.body.message,
          additionalRequirements: req.body.additionalRequirements,
        });
      } catch (emailError) {
        console.warn("Failed to send status update notification:", emailError);
        // Continue with success response even if email fails
      }
    }

    res.status(200).json({
      message: "Document request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete document request
const deleteDocumentRequest = async (req, res) => {
  try {
    const deleted = await DocumentRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  getDocumentRequestWithStudent,
  updateDocumentRequest,
  deleteDocumentRequest,
  getDocumentRequestsWithDetails,
};
