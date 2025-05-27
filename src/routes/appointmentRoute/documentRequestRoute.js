const express = require("express");
const router = express.Router();
const {
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequest,
  deleteDocumentRequest,
  getDocumentRequestWithStudent,
  getDocumentRequestsWithDetails,
} = require("../../controllers/appointmentController/documentRequest.controller");

router.post("/docs", createDocumentRequest);
router.get("/docs", getDocumentRequests);
router.get("/docs/:id", getDocumentRequestById);
router.put("/docs/:id", updateDocumentRequest);
router.delete("/docs/:id", deleteDocumentRequest);
router.get("/docs/with-student/:id", getDocumentRequestWithStudent); // <- New route
router.get("/docs-with-details", getDocumentRequestsWithDetails); // <- New route for detailed requests

module.exports = router;
