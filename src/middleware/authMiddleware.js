const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  if (!req.headers.authorization) {
    return res.status(401).json({ message: "No authorization header found" });
  }

  const parts = req.headers.authorization.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Authorization header must be in the format: Bearer <token>",
    });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (e.g., user ID)
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

module.exports = authMiddleware;
