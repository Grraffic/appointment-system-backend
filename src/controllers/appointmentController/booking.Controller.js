// controllers/appointmentController/bookingController.js
const Booking = require("../../models/appointmentSchema/bookingSchema");
const Schedule = require("../../models/adminSideSchema/maintenanceSchema/scheduleSchema");
const User = require("../../models/adminSideSchema/loginSchema/userSchema");
const { sendAppointmentConfirmation } = require("../../util/emailService");

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { userId, scheduleId } = req.body;

    // Check if schedule exists and is available
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check if slot is already booked by this user
    const existing = await Booking.findOne({ userId, scheduleId });
    if (existing) {
      return res.status(400).json({ message: "You already booked this slot" });
    }

    // Get user details for email notification
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new booking
    const newBooking = new Booking({ userId, scheduleId });
    const savedBooking = await newBooking.save();

    // Format date and time for email
    const appointmentDate = new Date(schedule.date);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation(user.email, {
        name: user.name,
        date: formattedDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        purpose: req.body.purpose || "General Appointment",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue with booking success response even if email fails
    }

    res.status(201).json({
      message:
        "Booking created successfully. A confirmation email has been sent.",
      booking: savedBooking,
    });
  } catch (err) {
    console.error("Booking error:", err);
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
      .populate("userId", "name email")
      .populate("scheduleId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
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
    const bookings = await Booking.find({ userId })
      .populate("scheduleId")
      .sort({ "scheduleId.date": 1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Get user bookings error:", err);
    res
      .status(500)
      .json({ message: "Failed to get user bookings", error: err.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId scheduleId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (status === "cancelled") {
      // TODO: Implement cancellation notification
      // await sendCancellationEmail(booking.userId.email, {
      //   name: booking.userId.name,
      //   date: booking.scheduleId.date
      // });
    }

    res.status(200).json(booking);
  } catch (err) {
    console.error("Update booking error:", err);
    res
      .status(500)
      .json({ message: "Failed to update booking", error: err.message });
  }
};
