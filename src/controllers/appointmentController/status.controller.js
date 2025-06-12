const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");
const { sendAppointmentStatusUpdate } = require("../../util/emailService");
const {
  createNotificationInternal,
} = require("../../controllers/adminSideController/dashboardController/notification.controller");

// Get all appointment statuses
exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await AppointmentStatus.find().sort({ dateOfRequest: -1 });

    // Fix missing appointment dates and times by looking up booking/schedule data
    const Booking = require("../../models/appointmentSchema/bookingSchema");
    const Schedule = require("../../models/adminSideSchema/maintenanceSchema/scheduleSchema");
    const Student = require("../../models/appointmentSchema/studentSchema");

    const fixedStatuses = await Promise.all(
      statuses.map(async (status) => {
        // If appointment date or time slot is missing, try to find it from booking data
        if (!status.appointmentDate || !status.timeSlot) {
          try {
            console.log(
              `Attempting to fix missing data for ${status.transactionNumber}`
            );

            // Find student by transaction number
            const student = await Student.findOne({
              transactionNumber: status.transactionNumber,
            });
            console.log(
              `Student found:`,
              student ? `${student.firstName} ${student.surname}` : "Not found"
            );

            if (student) {
              // Find booking for this student
              const booking = await Booking.findOne({
                studentId: student._id,
              }).populate("scheduleId");
              console.log(`Booking found:`, booking ? "Yes" : "No");
              console.log(
                `Schedule populated:`,
                booking?.scheduleId ? "Yes" : "No"
              );

              if (booking && booking.scheduleId) {
                const schedule = booking.scheduleId;
                console.log(`Schedule details:`, {
                  date: schedule.date,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                });

                // Update the status record with missing data
                const updateData = {};
                if (!status.appointmentDate && schedule.date) {
                  updateData.appointmentDate = schedule.date;
                }
                if (
                  !status.timeSlot &&
                  schedule.startTime &&
                  schedule.endTime
                ) {
                  updateData.timeSlot = `${schedule.startTime} - ${schedule.endTime}`;
                }

                if (Object.keys(updateData).length > 0) {
                  console.log(
                    `Fixing missing data for ${status.transactionNumber}:`,
                    updateData
                  );
                  await AppointmentStatus.findByIdAndUpdate(
                    status._id,
                    updateData
                  );

                  // Update the status object for the response
                  Object.assign(status, updateData);
                  console.log(
                    `Successfully updated status for ${status.transactionNumber}`
                  );
                } else {
                  console.log(
                    `No update needed for ${status.transactionNumber}`
                  );
                }
              } else {
                console.log(
                  `No booking or schedule found for ${status.transactionNumber}`
                );
              }
            }
          } catch (fixError) {
            console.error(
              `Error fixing status for ${status.transactionNumber}:`,
              fixError
            );
          }
        }
        return status;
      })
    );

    res.status(200).json(fixedStatuses);
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

    console.log("About to save appointment status:", appointmentStatus);
    await appointmentStatus.save();
    console.log("Appointment status saved successfully:", appointmentStatus);

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
    console.error("Error stack:", error.stack);
    console.error("Request params:", req.params);
    console.error("Request body:", req.body);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
