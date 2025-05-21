// models/Holiday.js
const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true }); // timestamps will add createdAt and updatedAt

// Ensure date is unique to prevent duplicate holiday entries for the same day
// holidaySchema.index({ date: 1 }, { unique: true });
// Commented out for now, as your requirements might allow multiple descriptions for one date.
// If a date should truly be unique, uncomment the above.

module.exports = mongoose.model('Holiday', holidaySchema);