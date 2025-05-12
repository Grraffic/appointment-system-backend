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
