const DocumentRequest = require("../../models/appointmentSchema/requestSchema");

// Create Document Request
const createDocumentRequest = async (req, res) => {
  try {
    const { studentId, selectedDocuments, purpose, dateOfRequest } = req.body;

    if (!studentId || !selectedDocuments || !purpose || !dateOfRequest) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRequest = new DocumentRequest({
      student: studentId,
      selectedDocuments,
      purpose,
      dateOfRequest,
    });

    await newRequest.save();
    res.status(201).json({ message: "Document request created successfully" });
  } catch (error) {
    console.error("Error creating document request:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Other Request CRUD...
const getDocumentRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching document requests:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getDocumentRequestById = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching request:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getDocumentRequestWithStudent = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student",
      "surname firstName middleName"
    );
    if (!request) return res.status(404).json({ message: "Not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching populated request:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateDocumentRequest = async (req, res) => {
  try {
    const updated = await DocumentRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating request:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteDocumentRequest = async (req, res) => {
  try {
    const deleted = await DocumentRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error.message);
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
