const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  files: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
      mimetype: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Attachment", attachmentSchema);
