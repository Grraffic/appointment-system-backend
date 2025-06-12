const express = require("express");
const router = express.Router();
const {
  updateStatus,
  getAllStatuses,
  deleteStatus,
} = require("../../controllers/appointmentController/status.controller");

// Debug endpoint to manually fix a specific appointment
router.post("/fix/:transactionNumber", async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");
    const Booking = require("../../models/appointmentSchema/bookingSchema");
    const Student = require("../../models/appointmentSchema/studentSchema");

    console.log(`Manual fix requested for ${transactionNumber}`);

    // Find the status record
    const status = await AppointmentStatus.findOne({ transactionNumber });
    if (!status) {
      return res.status(404).json({ message: "Status record not found" });
    }

    // Find student
    const student = await Student.findOne({ transactionNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find booking
    const booking = await Booking.findOne({ studentId: student._id }).populate(
      "scheduleId"
    );
    if (!booking || !booking.scheduleId) {
      return res.status(404).json({ message: "Booking or schedule not found" });
    }

    const schedule = booking.scheduleId;
    const updateData = {
      appointmentDate: schedule.date,
      timeSlot: `${schedule.startTime} - ${schedule.endTime}`,
    };

    await AppointmentStatus.findByIdAndUpdate(status._id, updateData);

    res.json({
      message: "Appointment fixed successfully",
      transactionNumber,
      updateData,
    });
  } catch (error) {
    console.error("Error fixing appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", getAllStatuses);
router.put("/status/:transactionNumber", updateStatus);
router.delete("/status/:transactionNumber", deleteStatus);

module.exports = router;
