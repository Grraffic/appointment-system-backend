const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByTransaction
} = require('../../controllers/appointmentController/feedback.controller');

router.post('/', submitFeedback);
router.get('/', getAllFeedback);
router.get('/:transactionNumber', getFeedbackByTransaction);

module.exports = router; 