const mongoose = require("mongoose");

const AppointmentRequestSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  lastSYAttended: String,
  programGradeStrand: String,
  contactNo: String,
  emailAddress: String,
  attachmentProof: String,
  requestType: String,
  dateOfRequest: Date,
  claimingMethod: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AppointmentRequest", AppointmentRequestSchema);
