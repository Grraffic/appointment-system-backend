const OTP = require("../models/OTP");
const User = require("../models/adminSideSchema/loginSchema/userSchema");
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

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: " LV Appointment System",
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
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// === CONTROLLERS ===

// Request OTP
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear old OTPs
    await OTP.deleteMany({ email });

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.create({ email, otp });

    // Send OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
