const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const {
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequest,
  deleteDocumentRequest,
  getDocumentRequestWithStudent,
  getDocumentRequestsWithDetails,
} = require("../../controllers/appointmentController/documentRequest.controller");

router.delete(
  "/docs/:transactionNumber",
  authMiddleware,
  deleteDocumentRequest
);
router.post("/docs", createDocumentRequest);
router.get("/docs", getDocumentRequests);
router.get("/docs/:id", getDocumentRequestById);
router.put("/docs/:id", updateDocumentRequest);
router.delete("/docs/:transactionNumber", deleteDocumentRequest);
router.get("/docs/with-student/:id", getDocumentRequestWithStudent); // <- New route
router.get("/docs-with-details", getDocumentRequestsWithDetails); // <- New route for detailed requests

module.exports = router;
