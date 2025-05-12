// routes/appointmentRoute/studentRoute.js
const express = require("express");
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  updateDocumentRequest,
  deleteDocumentRequest,
  getDocumentRequestWithStudent, // <- Add this
} = require("../../controllers/appointmentController/studentController");

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

router.post("/docs", createDocumentRequest);
router.get("/docs", getDocumentRequests);
router.get("/docs/:id", getDocumentRequestById);
router.put("/docs/:id", updateDocumentRequest);
router.delete("/docs/:id", deleteDocumentRequest);
router.get("/docs/with-student/:id", getDocumentRequestWithStudent); // <- New route

module.exports = router;
