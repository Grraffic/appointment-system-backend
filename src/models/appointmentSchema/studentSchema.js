// models/appointment/studentSchema.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  surname: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastSchoolYearAttended: {
    type: String,
    required: true,
    match: /^\d{4}\s*[-–]\s*\d{4}$/,
  },
  courseOrStrand: {
    type: String,
    required: true,
  },
  presentAddress: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, match: /^09\d{9}$/ },
  emailAddress: {
    type: String,
    required: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
});

module.exports = mongoose.model("Student", studentSchema);
