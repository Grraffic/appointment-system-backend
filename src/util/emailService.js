const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send email helper function
const sendEmail = async (mailOptions) => {
  try {
    const result = await transporter.sendMail({
      from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
      ...mailOptions,
    });
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.code === "EAUTH") {
      console.error(
        "Authentication error. Please check your email credentials."
      );
    }
    throw error;
  }
};

// Send email verification
exports.sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    await sendEmail({
      from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - LV AppointEase",
      html: `
        <h2>Welcome to LV AppointEase!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 20px 0;
        ">Verify Email</a>
        <p>If the button doesn't work, you can copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmailSafely({
      from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Password Reset - LV AppointEase",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 20px 0;
        ">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Send document request status update
exports.sendDocumentRequestUpdate = async (email, details) => {
  try {
    await transporter.sendMail({
      from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Document Request Update - ${details.status.toUpperCase()}`,
      html: `
        <h2>Document Request Update</h2>
        <p>Dear ${details.name},</p>
        <p>Your document request (ID: ${details.requestId}) has been ${
        details.status
      }.</p>
        <h3>Requested Documents:</h3>
        <ul>
          ${details.documents.map((doc) => `<li>${doc}</li>`).join("")}
        </ul>
        ${
          details.message
            ? `<p><strong>Message:</strong> ${details.message}</p>`
            : ""
        }
        ${
          details.pickupDate
            ? `<p><strong>Pickup Date:</strong> ${new Date(
                details.pickupDate
              ).toLocaleDateString()}</p>`
            : ""
        }
        ${
          details.additionalRequirements
            ? `
          <h3>Additional Requirements:</h3>
          <p>${details.additionalRequirements}</p>
        `
            : ""
        }
      `,
    });
  } catch (error) {
    console.error("Error sending document request update:", error);
    throw error;
  }
};

// Send appointment confirmation
exports.sendAppointmentConfirmation = async (email, details) => {
  try {
    await transporter.sendMail({
      from: `"LV AppointEase" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Appointment Confirmation - LV AppointEase",
      html: `
        <h2>Appointment Confirmation</h2>
        <p>Dear ${details.name},</p>
        <p>Your appointment has been confirmed for:</p>
        <p><strong>Date:</strong> ${details.date}</p>
        <p><strong>Time:</strong> ${details.startTime} - ${details.endTime}</p>
        <p><strong>Purpose:</strong> ${details.purpose}</p>
        <p>Please arrive 5-10 minutes before your scheduled time.</p>
        <p>If you need to reschedule or cancel your appointment, please do so at least 24 hours in advance.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending appointment confirmation:", error);
    throw error;
  }
};

// Send appointment confirmation email
exports.sendAppointmentConfirmation = async (email, appointmentDetails) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Appointment Confirmation - La Verdad Christian School",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #161f55;">Appointment Confirmation</h2>
          <p>Dear ${appointmentDetails.name},</p>
          <p>Your appointment has been successfully scheduled.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h3 style="color: #161f55;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${appointmentDetails.date}</p>
            <p><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</p>
            <p><strong>Purpose:</strong> ${appointmentDetails.purpose}</p>
          </div>
          <p style="margin-top: 20px;">Please arrive 15 minutes before your scheduled time. Don't forget to bring any necessary documents.</p>
          <p>If you need to reschedule or cancel your appointment, please contact us as soon as possible.</p>
          <p style="color: #666;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return false;
  }
};

// Send appointment status update email
exports.sendAppointmentStatusUpdate = async (
  emailAddress,
  { status, name, transactionNumber, appointmentDate, timeSlot }
) => {
  try {
    // Debug logs
    console.log("Sending status update email:", {
      emailAddress,
      status,
      name,
      transactionNumber,
      appointmentDate,
      timeSlot,
    });

    if (!emailAddress || !emailAddress.includes("@")) {
      throw new Error(`Invalid email address: ${emailAddress}`);
    }

    // Normalize status to uppercase
    status = status.toUpperCase();
    console.log("Normalized email status:", status);
    let subject, messageContent;

    if (status === "APPROVED") {
      subject = "Your Document Request Appointment has been Approved";
      messageContent = `
        <h2>Document Request Appointment Approved</h2>
        <p>Dear ${name},</p>
        <p>Your document request appointment (Transaction #: ${transactionNumber}) has been <strong style="color: #299057;">APPROVED</strong>.</p>
        <p>Appointment Details:</p>
        <ul>
          <li>Date: ${appointmentDate}</li>
          <li>Time: ${timeSlot}</li>
        </ul>
        <p>Please make sure to arrive on time for your appointment. Don't forget to bring any necessary identification or documents.</p>
        <p>Thank you for using our services!</p>
      `;
    } else if (status === "REJECTED") {
      subject = "Your Document Request Appointment Status Update";
      messageContent = `
        <h2>Document Request Appointment Update</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your document request appointment (Transaction #: ${transactionNumber}) has been <strong style="color: #D52121;">REJECTED</strong>.</p>
        <p>If you have any questions about this decision or would like to submit a new request, please contact our office.</p>
        <p>Thank you for your understanding.</p>
      `;
    } else if (status === "COMPLETED") {
      subject = "Your Document Request has been Completed";
      messageContent = `
        <h2>Document Request Completed</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your document request (Transaction #: ${transactionNumber}) has been <strong style="color: #354CCE;">COMPLETED</strong>.</p>
        <p>Your requested documents are now ready for pickup. Please visit our office during business hours to collect them.</p>
        <p>Remember to bring:</p>
        <ul>
          <li>Valid ID</li>
          <li>Transaction number: ${transactionNumber}</li>
          <li>Any applicable fees (if not paid)</li>
        </ul>
        <p>Thank you for using our services. We appreciate your patience throughout this process.</p>
      `;
    }

    if (subject && messageContent) {
      await sendEmail({
        to: emailAddress,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${messageContent}
            <hr>
            <p style="font-size: 12px; color: #666;">
              This is an automated message from LV AppointEase. Please do not reply to this email.
            </p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error("Error sending appointment status update email:", error);
    throw error;
  }
};
