const bcrypt = require("bcrypt");

const hashPassword = async (req, res, next) => {
  try {
    console.log("hashPassword middleware received body:", req.body);
    const { password, confirmPassword, name, email } = req.body;

    // Check all required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message:
          "All fields are required (name, email, password, confirmPassword)",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password format (at least 8 characters, includes special char)
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include letters, numbers, and special characters",
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(password, salt);
    delete req.body.confirmPassword; // Clean up for storage
    next();
  } catch (err) {
    console.error("Password hashing error:", err);
    return res.status(500).json({ message: "Error processing password" });
  }
};

module.exports = hashPassword;
