// models/AppointmentStatus.js
const mongoose = require("mongoose");

const AppointmentStatusSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    ref: "DocumentRequest", // Logical reference
  },
  requestType: String,
  emailAddress: String,
  appointmentDate: Date,
  timeSlot: String,
  dateOfRequest: Date,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
    default: "PENDING",
  },
});

module.exports = mongoose.model("AppointmentStatus", AppointmentStatusSchema);
