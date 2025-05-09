// const { sendLoginNotification } = require("../../../util/generateToken");
// // const User = require("../../../models/loginSchema/signInSchema");
// const User = require("../../../models/loginSchema/userSchema");

// const signIn = async (req, res) => {
//   const { email, password } = req.body;
//   console.log("Signin request received:", { email, password }); // Debug log

//   try {
//     const user = await User.findOne({ email });
//     console.log("User found:", user); // Debug log

//     if (!user) {
//       console.log("User not found"); // Debug log
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isMatch = await user.comparePassword(password);
//     console.log("Password match status:", isMatch); // Debug log

//     if (!isMatch) {
//       console.log("Invalid credentials"); // Debug log
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = generateToken(user._id);
//     console.log("Generated token:", token); // Debug log

//     const loginDetails = {
//       time: new Date().toLocaleString(),
//       ip: req.ip || "Unknown IP",
//     };
//     sendLoginNotification(user.email, loginDetails);

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error); // Debug log
//     res.status(500).json({ message: "Login failed", error: error.message });
//   }
// };

module.exports = { signIn };

const {
  sendLoginNotification,
  generateToken,
} = require("../../../util/generateToken");
const User = require("../../../models/loginSchema/userSchema");

const signIn = async (req, res) => {
  const { email, password } = req.body;
  console.log("Signin request received:", { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    const loginDetails = {
      time: new Date().toLocaleString(),
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
    };

    try {
      await sendLoginNotification(user.email, loginDetails);
    } catch (err) {
      console.warn("Login email failed:", err.message);
    }

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signIn };
