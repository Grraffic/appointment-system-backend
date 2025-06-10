const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret_here";
  return jwt.sign({ id: userId }, secret, { expiresIn: "1d" });
};

// Send login notification email
const sendLoginNotification = async (email, loginDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_PASS, // Gmail App Password (not normal password)
    },
  });

  const mailOptions = {
    from: `"Your App Name" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Login Notification",
    text: `Hello,

You just logged into your account.

Date & Time: ${loginDetails.time}
IP Address: ${loginDetails.ip}

If this wasn't you, please secure your account immediately.

- Your App Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Login notification sent to ${email}`);
  } catch (error) {
    console.error("Error sending login notification:", error.message);
  }
};

module.exports = {
  generateToken,
  sendLoginNotification,
};
