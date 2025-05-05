const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret_here";
  return jwt.sign({ id: userId }, secret, { expiresIn: "1d" });
};

module.exports = generateToken;
