const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  selectedDocuments: {
    type: [String], // Array to allow multiple selections
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
