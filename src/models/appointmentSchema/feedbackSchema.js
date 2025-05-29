const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  transactionNumber: {
    type: String,
    required: true
  },
  ratings: {
    easyToUse: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    features: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    responsiveness: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema); 