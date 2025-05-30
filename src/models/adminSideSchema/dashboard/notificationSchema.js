const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["user-action", "system"],
      required: true,
    },
    userName: String, // For user-action type
    action: {
      type: String,
      required: true,
    },
    reference: String, // Transaction number reference
    status: String, // Status if applicable
    details: String, // Additional details
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppointmentStatus",
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
