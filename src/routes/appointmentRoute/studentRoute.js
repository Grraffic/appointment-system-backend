// // routes/appointmentRoute/studentRoute.js
// const express = require("express");
// const router = express.Router();
// const {
//   createStudent,
// } = require("../../controllers/appointmentController/studentController");

// router.post("/", createStudent);
// router.get("/", getStudents); // Add this

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../../controllers/appointmentController/studentController");

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
