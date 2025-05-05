const bcrypt = require("bcrypt");

const hashPassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword || password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Passwords are missing or do not match" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(password, salt);
    delete req.body.confirmPassword; // Clean up for storage
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error hashing password", error: err.message });
  }
};

module.exports = hashPassword;
