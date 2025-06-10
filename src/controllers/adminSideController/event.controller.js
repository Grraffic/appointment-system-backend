// src/controllers/event.controller.js
const Event = require('../../models/eventSchema/event.model');

// Middleware to get event by ID
const getEventByIdMiddleware = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        req.event = event;
        next();
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid event ID' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET all events (can add query params for date range later)
const getAllEvents = async (req, res) => {
    try {
       

        const events = await Event.find().sort({ startDate: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve events', error: error.message });
    }
};

// POST (Create) a new event
const createEvent = async (req, res) => {
    const { title, description, startDate, endDate, color } = req.body;
    if (!title || !startDate || !endDate) {
        return res.status(400).json({ message: 'Title, start date, and end date are required' });
    }
    try {
        const newEvent = new Event({ title, description, startDate, endDate, color });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", errors: error.errors });
        }
        res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
};

// PUT (Update) an event
const updateEvent = async (req, res) => {
    const { title, description, startDate, endDate, color } = req.body;
    if (title) req.event.title = title;
    if (description) req.event.description = description;
    if (startDate) req.event.startDate = startDate;
    if (endDate) req.event.endDate = endDate;
    if (color) req.event.color = color;

    try {
        const updatedEvent = await req.event.save();
        res.status(200).json(updatedEvent);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", errors: error.errors });
        }
        res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
};

// DELETE an event
const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.event._id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete event', error: error.message });
    }
};

module.exports = {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventByIdMiddleware,
};