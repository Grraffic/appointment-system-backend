const Holiday = require('../../models/holidaySchema/holiday.model');

const getHolidayById = async (req, res, next) => {
    let holiday;
    try {
        holiday = await Holiday.findById(req.params.id);
        if (holiday == null) {
            return res.status(404).json({ message: 'Cannot find holiday' });
        }
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid holiday ID format' });
        }
        return res.status(500).json({ message: err.message });
    }
    res.holiday = holiday;
    next();
};

// GET all holidays
const getAllHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.json(holidays);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST (Create) a new holiday
const createHoliday = async (req, res) => {
    const { date, description } = req.body;
    console.log("Attempting to create holiday with data:", { date, description });

    if (!date || !description) {
        console.log("Validation failed: Date or description missing.");
        return res.status(400).json({ message: 'Date and description are required' });
    }

    try {
        const newHoliday = new Holiday({ date, description });
        await newHoliday.save();
        console.log("Holiday saved successfully:", newHoliday);
        res.status(201).json(newHoliday);
    } catch (error) {
        console.error("ERROR CREATING HOLIDAY IN BACKEND:", error);
        console.error("Error Name:", error.name);
        console.error("Error Code:", error.code);
        console.error("Error Errors object (if validation error):", error.errors);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", errors: error.errors });
        }
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'A holiday with this data (e.g., date) already exists.' });
        }
        res.status(500).json({ message: 'Failed to create holiday on server', error: error.message });
    }
};

// GET a specific holiday by ID
const getHoliday = (req, res) => {
    res.json(res.holiday);
};

// PUT (Update) a holiday
const updateHoliday = async (req, res) => {
    const { date, description } = req.body;

    if (date != null) {
        if (isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date format for update' });
        }
        res.holiday.date = date;
    }
    if (description != null) {
        res.holiday.description = description;
    }

    try {
        const updatedHoliday = await res.holiday.save();
        res.json(updatedHoliday);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A holiday with this date already exists.' });
        }
        res.status(400).json({ message: err.message });
    }
};

// DELETE a holiday
const deleteHoliday = async (req, res) => {
    try {
        await res.holiday.deleteOne();
        res.json({ message: 'Deleted Holiday' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllHolidays,
    createHoliday,
    getHoliday,
    updateHoliday,
    deleteHoliday,
    getHolidayById,
};