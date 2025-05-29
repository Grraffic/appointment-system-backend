const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");
const { sendAppointmentStatusUpdate } = require("../../util/emailService");

// Get all appointment stat uses
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
    let { status, emailAddress, name, appointmentDate, timeSlot } = req.body;

    // Debug logs
    console.log("Received status update request:", {
      transactionNumber,
      status,
      emailAddress,
      name,
      appointmentDate,
      timeSlot,
    });

    // Normalize status to uppercase
    status = status ? status.toUpperCase() : "PENDING";
    console.log("Normalized status:", status);

    // Validate status
    if (!["PENDING", "APPROVED", "REJECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the appointment status and update it
    let appointmentStatus = await AppointmentStatus.findOne({
      transactionNumber,
    });

    if (!appointmentStatus) {
      // If status doesn't exist, create it with the provided status or PENDING as default
      appointmentStatus = new AppointmentStatus({
        transactionNumber,
        status,
        dateOfRequest: new Date(),
        emailAddress,
        appointmentDate,
        timeSlot,
      });
    } else {
      // Update existing status - also update other fields if provided
      appointmentStatus.status = status;
      if (emailAddress) appointmentStatus.emailAddress = emailAddress;
      if (appointmentDate) appointmentStatus.appointmentDate = appointmentDate;
      if (timeSlot) appointmentStatus.timeSlot = timeSlot;
    }

    await appointmentStatus.save();

    // Send email notification for APPROVED or REJECTED status
    if (
      (status === "APPROVED" || status === "REJECTED") &&
      appointmentStatus.emailAddress
    ) {
      try {
        if (!appointmentStatus.emailAddress.includes("@")) {
          console.warn(
            `Invalid email address for transaction ${transactionNumber}: ${appointmentStatus.emailAddress}`
          );
        } else {
          await sendAppointmentStatusUpdate(appointmentStatus.emailAddress, {
            status,
            name: name || "Student",
            transactionNumber,
            appointmentDate: appointmentStatus.appointmentDate
              ? new Date(appointmentStatus.appointmentDate).toLocaleDateString()
              : "Not set",
            timeSlot: appointmentStatus.timeSlot || "Not set",
          });
          console.log(`Status update email sent for ${transactionNumber}`);
        }
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError, {
          emailAddress: appointmentStatus.emailAddress,
          transactionNumber,
          status,
        });
        // Continue with the response even if email fails
      }
    } else if (
      (status === "APPROVED" || status === "REJECTED") &&
      !appointmentStatus.emailAddress
    ) {
      console.warn(
        `Cannot send email notification: No email address found for transaction ${transactionNumber}`
      );
    }

    res.status(200).json(appointmentStatus);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete status
exports.deleteStatus = async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const deleted = await AppointmentStatus.findOneAndDelete({
      transactionNumber,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// module.exports = {
//   updateStatus,
//   getAllStatuses,
//   deleteStatus,
// };
