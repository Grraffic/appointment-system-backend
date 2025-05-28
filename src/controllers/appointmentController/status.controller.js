const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");
const { sendAppointmentStatusUpdate } = require("../../util/emailService");

// Get all appointment statuses
exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await AppointmentStatus.find().sort({ dateOfRequest: -1 });
    res.status(200).json(statuses);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update appointment status
exports.updateStatus = async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const { status } = req.body; // Find the appointment status and update it
    const appointmentStatus = await AppointmentStatus.findOne({
      transactionNumber,
    });

    if (!appointmentStatus) {
      // If status doesn't exist, create it with PENDING as default if no status provided
      const newStatus = new AppointmentStatus({
        transactionNumber,
        status: status || "PENDING",
        dateOfRequest: new Date(),
      });
      await newStatus.save();
      res.status(201).json(newStatus);
    } else {
      // Update existing status
      appointmentStatus.status = status;
      await appointmentStatus.save();
      res.status(200).json(appointmentStatus);
    }

    // TODO: Implement email notification here if needed
    // try {
    //   await sendAppointmentStatusUpdate(appointmentStatus.emailAddress, {
    //     status,
    //     transactionNumber
    //   });
    // } catch (emailError) {
    //   console.warn("Failed to send status update email:", emailError);
    // }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
