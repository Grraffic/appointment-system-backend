// src/models/event.model.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date, // Store as full Date objects
        required: [true, 'Event start date is required'],
    },
    endDate: {
        type: Date, // Store as full Date objects
        required: [true, 'Event end date is required'],
    },
    // Optional: Add color or other event-specific properties
    color: {
        type: String,
        default: 'bg-blue-500', // Default Tailwind color class
    }
    // Optional: userId if events are user-specific
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Optional: Add an index if you often query by date range
eventSchema.index({ startDate: 1, endDate: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;