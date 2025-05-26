const OTP = require("../../../models/adminSideSchema/loginSchema/OTP");
const User = require("../../../models/adminSideSchema/loginSchema/userSchema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Input validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email with improved error handling
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: "LV Appointment System",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #161F55; text-align: center;">Password Reset Request</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p style="font-size: 16px; color: #333;">Your verification code is:</p>
          <h2 style="color: #161F55; text-align: center; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
          <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you did not request this code, please ignore this email.</p>
        </div>
        <div style="margin-top: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p style="color: #666; font-size: 14px;">
            <strong>Security Tips:</strong>
            <ul>
              <li>Never share this code with anyone</li>
              <li>Enter the code exactly as shown</li>
              <li>The code is case-sensitive</li>
              <li>Make sure to use it within 5 minutes</li>
            </ul>
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
};

// === CONTROLLERS ===

// Request OTP with improved validation
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Clear old OTPs for this email
    await OTP.deleteMany({ email });

    // Generate and save new OTP
    const otp = generateOTP();
    const otpDoc = await OTP.create({ email, otp });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully to your email",
      otpId: otpDoc._id,
    });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Verify OTP with improved validation and error handling
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!otp || !validateOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 6-digit verification code",
      });
    }

    // Find the most recent OTP for this email
    const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
    }

    // Check if OTP is expired (5 minutes)
    const now = new Date();
    const otpCreatedAt = new Date(otpRecord.createdAt);
    const diffMinutes = (now - otpCreatedAt) / (1000 * 60);

    if (diffMinutes > 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "Verification successful",
      email: email,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Reset password with improved validation and security
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Additional password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
