// controllers/appointmentController/bookingController.js
const Booking = require("../../models/appointmentSchema/bookingSchema");
const Schedule = require("../../models/adminSideSchema/maintenanceSchema/scheduleSchema");
const Student = require("../../models/appointmentSchema/studentSchema");
const { sendAppointmentConfirmation } = require("../../util/emailService");

const {
  createNotificationInternal,
} = require("../../controllers/adminSideController/dashboardController/notification.controller");

// @desc    Create a new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { studentId, scheduleId } = req.body;

    // Check if schedule exists and is available
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check if slots are still available
    if (schedule.slots <= 0) {
      return res
        .status(400)
        .json({ message: "No slots available for this schedule" });
    }

    // Get student details for email notification
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if slot is already booked by this student
    const existing = await Booking.findOne({ studentId, scheduleId });
    if (existing) {
      return res.status(400).json({ message: "You already booked this slot" });
    }

    // IMPORTANT: Check if status record already exists to prevent duplicates
    const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");

    // TEMPORARILY DISABLED: Remove duplicate check until database is confirmed clean
    // const existingStatus = await AppointmentStatus.findOne({
    //   transactionNumber: student.transactionNumber,
    // });

    // if (existingStatus) {
    //   return res.status(400).json({
    //     message:
    //       "An appointment request already exists for this transaction number",
    //   });
    // }

    // console.log(
    //   "Duplicate check temporarily disabled - allowing appointment creation"
    // );
    // console.log("Student transaction number:", student.transactionNumber);
    // console.log("Schedule ID:", scheduleId);

    // Determine if it's morning or afternoon based on the schedule's startTime
    const timeSlot = schedule.startTime.toLowerCase().includes("am")
      ? "MORNING"
      : "AFTERNOON";

    // Format date and time for email
    const appointmentDate = new Date(schedule.date);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Start a session for transaction
    const session = await Booking.startSession();
    let savedBooking;

    try {
      await session.withTransaction(async () => {
        // Decrease slot count
        const updatedSchedule = await Schedule.findByIdAndUpdate(
          scheduleId,
          { $inc: { slots: -1 } },
          { new: true, session }
        );

        if (!updatedSchedule) {
          throw new Error("Failed to update schedule slots");
        }

        // Create new booking
        const newBooking = new Booking({ studentId, scheduleId });
        savedBooking = await newBooking.save({ session });

        // Create the status record ONLY after booking is successfully created
        await AppointmentStatus.create(
          [
            {
              transactionNumber: student.transactionNumber,
              timeSlot: timeSlot,
              status: "PENDING",
              appointmentDate: schedule.date,
              emailAddress: student.emailAddress,
              dateOfRequest: new Date(),
            },
          ],
          { session }
        );

        // Create notification for new appointment
        try {
          await createNotificationInternal({
            type: "system",
            action: "New appointment has been submitted!",
            reference: student.transactionNumber,
            details: `${student.firstName.replace(
              /<[^>]*>/g,
              ""
            )} ${student.surname.replace(
              /<[^>]*>/g,
              ""
            )} has booked an appointment for ${formattedDate.replace(
              /<[^>]*>/g,
              ""
            )} at ${schedule.startTime.replace(/<[^>]*>/g, "")}`,
            read: false,
          });
        } catch (notifError) {
          console.error("Failed to create notification:", notifError);
        }
      });
    } finally {
      await session.endSession();
    }

    // Get the updated schedule for response
    const updatedSchedule = await Schedule.findById(scheduleId);

    // Send confirmation email
    try {
      await sendAppointmentConfirmation(student.emailAddress, {
        name: `${student.firstName} ${student.surname}`,
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
      remainingSlots: updatedSchedule.slots,
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
      .populate("studentId", "surname firstName emailAddress")
      .populate("scheduleId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res
      .status(500)
      .json({ message: "Failed to get bookings", error: err.message });
  }
};

// @desc    Get bookings for a specific student
// @route   GET /api/bookings/student/:studentId
exports.getBookingsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const bookings = await Booking.find({ studentId })
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
