const DocumentRequest = require("../../models/appointmentSchema/requestSchema");
const Student = require("../../models/appointmentSchema/studentSchema");
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
};
