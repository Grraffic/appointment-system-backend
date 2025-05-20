// src/services/documentRequestServices.js
import axios from "axios";

// Adjust this URL to your actual backend API endpoint for document requests
const API_URL = "http://localhost:5000/api/document-requests";

/**
 * Creates a new document request.
 * @param {object} requestData - The document request data.
 * Expected fields: studentId, selectedDocuments (array of strings/labels),
 * purpose, dateOfRequest (ISO string).
 * @returns {Promise<object>} The response data from the backend.
 */
export const createDocumentRequest = async (requestData) => {
  try {
    // The backend route for creating a document request is POST /api/document-requests/docs
    const response = await axios.post(`${API_URL}/docs`, requestData);
    return response.data; // Assuming backend returns { message: "...", request: savedRequest }
  } catch (error) {
    console.error(
      "Error creating document request:",
      error.response ? error.response.data : error.message
    );
    throw error.response
      ? error.response.data
      : new Error("Network or server error during document request creation");
  }
};
