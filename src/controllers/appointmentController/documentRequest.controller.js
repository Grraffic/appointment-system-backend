const DocumentRequest = require("../../models/appointmentSchema/requestSchema");
const Student = require("../../models/appointmentSchema/studentSchema");
const Attachment = require("../../models/appointmentSchema/attachmentSchema");
const Booking = require("../../models/appointmentSchema/bookingSchema");
const { sendDocumentRequestUpdate } = require("../../util/emailService");
const {
  createNotificationInternal,
} = require("../../controllers/adminSideController/dashboardController/notification.controller");

// Create Document Request
const createDocumentRequest = async (req, res) => {
  try {
    const { studentId, selectedDocuments, purpose, dateOfRequest } = req.body;

    if (!studentId || !selectedDocuments || !purpose || !dateOfRequest) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the request
    const newRequest = new DocumentRequest({
      student: studentId,
      selectedDocuments,
      purpose,
      dateOfRequest,
    });
    const savedRequest = await newRequest.save();

    // Get student details for notification
    const student = await Student.findById(studentId);

    if (student) {
      // Create a basic status record for the new request using student's transactionNumber
      // Appointment details (date/time) will be added when booking is completed
      const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");

      // Check if status record already exists for this student
      const existingStatus = await AppointmentStatus.findOne({
        transactionNumber: student.transactionNumber,
      });

      if (!existingStatus) {
        const newStatus = new AppointmentStatus({
          transactionNumber: student.transactionNumber,
          requestType: selectedDocuments.join(", "),
          emailAddress: student.emailAddress,
          dateOfRequest: dateOfRequest,
          status: "PENDING",
          // appointmentDate and timeSlot will be set when booking is completed
        });
        await newStatus.save();
        console.log(
          `Created basic status record for student ${student.transactionNumber} - appointment details will be added upon booking`
        );
      } else {
        console.log(
          `Status record already exists for student ${student.transactionNumber}`
        );
      }

      try {
        await sendDocumentRequestUpdate(student.emailAddress, {
          name: `${student.firstName} ${student.surname}`,
          requestId: savedRequest._id,
          status: "processing",
          documents: selectedDocuments,
          message:
            "Your document request has been received and is being processed.",
        });
      } catch (emailError) {
        console.warn("Failed to send request notification:", emailError);
        // Continue with success response even if email fails
      }
    }

    res.status(201).json({
      message: "Document request created successfully",
      request: savedRequest,
    });
  } catch (error) {
    console.error("Error creating document request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all document requests
const getDocumentRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find()
      .populate("student", "surname firstName middleName emailAddress")
      .sort({ dateOfRequest: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching document requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get document request by ID
const getDocumentRequestById = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student",
      "surname firstName middleName emailAddress"
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get document request with student details
const getDocumentRequestWithStudent = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student"
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching populated request:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const generateTransactionNumber = () => {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000; // Generate a 6-digit random number
  const randomSuffix = Math.floor(Math.random() * 900) + 100; // Generate a 3-digit random number
  return `TR${randomNumber}-${randomSuffix}`;
};

const getDocumentRequestsWithDetails = async (req, res) => {
  try {
    // Get all requests with student info
    const requests = await DocumentRequest.find()
      .populate("student")
      .sort({ dateOfRequest: -1 });

    if (!requests || !Array.isArray(requests)) {
      return res.status(200).json([]);
    }

    // Get all attachments
    const attachments = await Attachment.find();

    // Get all appointment statuses to get appointment dates and times
    const AppointmentStatus = require("../../models/adminSideSchema/dashboard/statusSchema");
    const appointmentStatuses = await AppointmentStatus.find();

    // Create a map of transaction numbers to appointment status info
    const statusMap = appointmentStatuses.reduce((acc, status) => {
      if (status.transactionNumber) {
        acc[status.transactionNumber] = {
          appointmentDate: status.appointmentDate,
          timeSlot: status.timeSlot,
          status: status.status,
        };
      }
      return acc;
    }, {});

    // Get all bookings with schedule info (as fallback)
    const bookings = await Booking.find()
      .populate("scheduleId")
      .sort({ "scheduleId.date": 1 });

    // Create a map of student IDs to their bookings
    const bookingMap = bookings.reduce((acc, booking) => {
      if (booking.studentId && booking.scheduleId) {
        acc[booking.studentId.toString()] = {
          date: booking.scheduleId.date,
          startTime: booking.scheduleId.startTime,
          endTime: booking.scheduleId.endTime,
        };
      }
      return acc;
    }, {});

    // Map requests to include attachment info
    const result = requests
      .map((req) => {
        try {
          if (
            !req.student ||
            !req.student._id ||
            !req.student.transactionNumber
          ) {
            return null; // Mark as invalid
          }

          const studentAttachments = attachments
            .filter((att) => att.files && Array.isArray(att.files))
            .flatMap((att) => att.files)
            .filter(
              (file) =>
                file &&
                file.student &&
                file.student.toString() === req.student._id.toString()
            );

          const filenames = studentAttachments
            .filter((file) => file && file.filename)
            .map((file) => file.filename);

          // Get appointment status info for this student
          const statusInfo = statusMap[req.student.transactionNumber];
          // Get booking info as fallback
          const bookingInfo = bookingMap[req.student._id.toString()];

          // Use status info first, then fallback to booking info
          let appointmentDate = "Not scheduled";
          let timeSlot = "Not scheduled";

          if (statusInfo?.appointmentDate) {
            appointmentDate = new Date(
              statusInfo.appointmentDate
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } else if (bookingInfo?.date) {
            appointmentDate = new Date(bookingInfo.date).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );
          }

          if (statusInfo?.timeSlot) {
            timeSlot = statusInfo.timeSlot;
          } else if (bookingInfo?.startTime && bookingInfo?.endTime) {
            timeSlot = `${bookingInfo.startTime} - ${bookingInfo.endTime}`;
          }

          console.log(
            `DEBUG: Appointment data for ${req.student.transactionNumber}:`,
            {
              statusInfo: statusInfo,
              bookingInfo: bookingInfo
                ? {
                    date: bookingInfo.date,
                    startTime: bookingInfo.startTime,
                    endTime: bookingInfo.endTime,
                  }
                : null,
              finalAppointmentDate: appointmentDate,
              finalTimeSlot: timeSlot,
            }
          );

          return {
            transactionNumber: req.student.transactionNumber,
            name: `${req.student.surname || ""}, ${
              req.student.firstName || ""
            } ${req.student.middleName || ""}`.trim(),
            lastSY: req.student.lastSchoolYearAttended || "N/A",
            program: req.student.courseOrStrand || "N/A",
            contact: req.student.contactNumber || "N/A",
            email: req.student.emailAddress || "N/A",
            attachment:
              filenames.length > 0 ? filenames.join(", ") : "No attachments",
            request: Array.isArray(req.selectedDocuments)
              ? req.selectedDocuments.join(", ")
              : "No documents selected",
            date: req.dateOfRequest
              ? req.dateOfRequest.toISOString().split("T")[0]
              : "N/A",
            timeSlot: timeSlot,
            appointmentDate: appointmentDate,
          };
        } catch (error) {
          console.error("Error processing request:", error);
          return null; // Mark as invalid
        }
      })
      .filter((entry) => entry !== null); // Remove all null/invalid rows

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching document requests with details:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Update document request
const updateDocumentRequest = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id).populate(
      "student",
      "surname firstName middleName emailAddress"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update the request
    Object.assign(request, req.body);
    const updatedRequest = await request.save();

    // Send status update email if status is provided and student email exists
    if (req.body.status && request.student.emailAddress) {
      try {
        await sendDocumentRequestUpdate(request.student.emailAddress, {
          name: `${request.student.firstName} ${request.student.surname}`,
          requestId: request._id,
          status: req.body.status,
          documents: request.selectedDocuments,
          pickupDate: req.body.pickupDate,
          message: req.body.message,
          additionalRequirements: req.body.additionalRequirements,
        });
      } catch (emailError) {
        console.warn("Failed to send status update notification:", emailError);
        // Continue with success response even if email fails
      }
    }

    res.status(200).json({
      message: "Document request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete document request
const deleteDocumentRequest = async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const { adminName } = req.body; // Get admin name from request body

    // Find the student by transaction number
    const student = await Student.findOne({ transactionNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find and delete the document request
    const deleted = await DocumentRequest.findOneAndDelete({
      student: student._id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Document request not found" });
    }

    // Create internal notification
    try {
      const userName = adminName || req.user?.name || "Admin";
      console.log("Creating delete notification with data:", {
        type: "user-action",
        userName: userName,
        action: "deleted the appointment of",
        reference: transactionNumber,
        status: "DELETED",
        details: `Appointment with transaction number ${transactionNumber} has been deleted`,
        adminName: adminName,
      });

      const notification = await createNotificationInternal({
        type: "user-action",
        userName: userName,
        action: "deleted the appointment of",
        reference: transactionNumber,
        status: "DELETED",
        details: `Appointment with transaction number ${transactionNumber} has been deleted`,
        read: false,
      });

      console.log("Notification created:", notification);
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Continue with the response even if notification creation fails
    }

    res.status(200).json({ message: "Document request deleted successfully" });
  } catch (error) {
    console.error("Error deleting document request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  getDocumentRequestWithStudent,
  updateDocumentRequest,
  deleteDocumentRequest,
  getDocumentRequestsWithDetails,
};
