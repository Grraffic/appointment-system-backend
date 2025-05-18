const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    slots: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // or Date if using ISO time strings (e.g. "2024-12-27T08:00:00Z")
      required: true,
    },
    endTime: {
      type: String, // or Date
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
