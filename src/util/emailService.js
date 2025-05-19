const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send email verification
exports.sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    await transporter.sendMail({
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

    await transporter.sendMail({
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
