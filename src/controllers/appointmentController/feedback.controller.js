const Feedback = require('../../models/appointmentSchema/feedbackSchema');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    console.log('Received feedback submission request:', req.body);
    const { name, transactionNumber, ratings } = req.body;

    // Validate required fields
    if (!name || !transactionNumber || !ratings) {
      console.log('Missing required fields:', { name, transactionNumber, ratings });
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name,
          transactionNumber: !transactionNumber,
          ratings: !ratings
        }
      });
    }

    // Validate ratings
    const requiredRatings = ['easyToUse', 'features', 'responsiveness', 'reliability'];
    const missingRatings = requiredRatings.filter(rating => !ratings[rating]);
    if (missingRatings.length > 0) {
      console.log('Missing ratings:', missingRatings);
      return res.status(400).json({ 
        message: 'Missing required ratings',
        details: { missingRatings }
      });
    }

    const feedback = new Feedback({
      name,
      transactionNumber,
      ratings
    });

    console.log('Saving feedback:', feedback);
    await feedback.save();
    console.log('Feedback saved successfully');
    
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      message: 'Failed to submit feedback', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const { sort = 'newest' } = req.query;
    const sortOrder = sort === 'newest' ? -1 : 1;

    const feedback = await Feedback.find()
      .sort({ dateSubmitted: sortOrder });

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

// Get feedback by transaction number
exports.getFeedbackByTransaction = async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const feedback = await Feedback.findOne({ transactionNumber });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
}; 