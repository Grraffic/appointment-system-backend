// models/appointmentSchema/requestSchema.js
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  selectedDocuments: {
    type: [String],
    enum: {
      values: [
        "Certificate of Enrollment",
        "Form 137",
        "Transcript of Records",
        "Good Moral Certificate",
        "Certified True Copy of Documents",
        "Education Service Contracting Certificate",
      ],
      message: "{VALUE} is not a valid document type",
    },
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfRequest: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("DocumentRequest", requestSchema);
