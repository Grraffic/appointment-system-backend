// controllers/appointmentController/bookingController.js
const Booking = require("../../models/appointmentSchema/bookingSchema");
const Schedule = require("../../models/adminSideSchema/maintenanceSchema/scheduleSchema");

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { userId, scheduleId } = req.body;

    // Optional: Check if schedule exists
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Optional: Check if slot is already booked by this user
    const existing = await Booking.findOne({ userId, scheduleId });
    if (existing) {
      return res.status(400).json({ message: "You already booked this slot" });
    }

    const newBooking = new Booking({ userId, scheduleId });
    const savedBooking = await newBooking.save();

    res.status(201).json(savedBooking);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create booking", error: err.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email") // Add fields you want
      .populate("scheduleId");
    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get bookings", error: err.message });
  }
};

// @desc    Get bookings for a specific user
// @route   GET /api/bookings/user/:userId
exports.getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).populate("scheduleId");
    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get user bookings", error: err.message });
  }
};
