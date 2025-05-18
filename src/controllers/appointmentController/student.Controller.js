const Student = require("../../models/appointmentSchema/studentSchema");

// Create Student
const createStudent = async (req, res) => {
  try {
    const {
      surname,
      firstName,
      middleName,
      lastSchoolYearAttended,
      courseOrStrand,
      presentAddress,
      contactNumber,
      emailAddress,
    } = req.body;

    if (
      !surname ||
      !firstName ||
      !middleName ||
      !lastSchoolYearAttended ||
      !courseOrStrand ||
      !presentAddress ||
      !contactNumber ||
      !emailAddress
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^09\d{9}$/.test(contactNumber)) {
      return res.status(400).json({
        message: "Contact number must start with 09 and have 11 digits.",
      });
    }

    const newStudent = new Student({
      surname,
      firstName,
      middleName,
      lastSchoolYearAttended,
      courseOrStrand,
      presentAddress,
      contactNumber,
      emailAddress,
    });

    await newStudent.save();
    res
      .status(201)
      .json({
        message: "Student data saved successfully",
        studentId: newStudent._id,
      });
  } catch (error) {
    console.error("Error saving student:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Other Student CRUD operations...
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student updated successfully", updated });
  } catch (error) {
    console.error("Error updating student:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
