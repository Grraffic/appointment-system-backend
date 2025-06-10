const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");
const { sendAppointmentStatusUpdate } = require("../../util/emailService");
const {
  createNotificationInternal,
} = require("../../controllers/adminSideController/dashboardController/notification.controller");

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
    let { status, emailAddress, name, appointmentDate, timeSlot, adminName } =
      req.body;

    console.log("Received status update request:", {
      transactionNumber,
      status,
      emailAddress,
      name,
      appointmentDate,
      timeSlot,
      adminName,
    });

    // Normalize status
    status = status ? status.toUpperCase() : "PENDING";
    console.log("Normalized status:", status);

    // Validate
    if (!["PENDING", "APPROVED", "REJECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update or create
    let appointmentStatus = await AppointmentStatus.findOne({
      transactionNumber,
    });

    if (!appointmentStatus) {
      appointmentStatus = new AppointmentStatus({
        transactionNumber,
        status,
        dateOfRequest: new Date(),
        emailAddress,
        appointmentDate,
        timeSlot,
      });
    } else {
      appointmentStatus.status = status;
      if (emailAddress) appointmentStatus.emailAddress = emailAddress;
      if (appointmentDate) appointmentStatus.appointmentDate = appointmentDate;
      if (timeSlot) appointmentStatus.timeSlot = timeSlot;
    }

    await appointmentStatus.save();

    // Create internal notification
    try {
      const userName = adminName || req.user?.name || "Admin";
      console.log("Creating notification with userName:", userName);
      console.log("adminName from request:", adminName);
      console.log("req.user:", req.user);

      const notificationData = {
        type: "user-action",
        userName: userName,
        action: "updated the status appointment of",
        reference: transactionNumber,
        status: status,
        details: `Appointment status changed to ${status.replace(
          /<[^>]*>/g,
          ""
        )}`,
        read: false,
      };

      console.log("Notification data being created:", notificationData);
      await createNotificationInternal(notificationData);
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    // Send email if needed
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
            adminName: adminName || "Admin", // Include admin name in email
          });
          console.log(`Status update email sent for ${transactionNumber}`);
        }
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError, {
          emailAddress: appointmentStatus.emailAddress,
          transactionNumber,
          status,
        });
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

// Delete appointment status
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
