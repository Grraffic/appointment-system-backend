// routes/appointmentRoute/bookingRoute.js
const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/appointmentController/booking.Controller");

// Create a new booking
router.post("/", bookingController.createBooking);

// Get all bookings
router.get("/", bookingController.getAllBookings);

// Get bookings for a specific user
router.get("/user/:userId", bookingController.getBookingsByUser);

module.exports = router;
