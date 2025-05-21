// const User = require("../../../models/adminSideSchema/loginSchema/userSchema");
// const { generateToken } = require("../../../util/generateToken");
// const bcrypt = require("bcrypt");

// exports.signin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("Login attempt for email:", email);

//     // Validate input
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("User not found with email:", email);
//       return res.status(401).json({ message: "Invalid email or password" });
//     }
//     console.log("User found:", {
//       email: user.email,
//       hashedPassword: user.password,
//     });

//     // Compare password using bcrypt directly
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("Password match result:", isMatch);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Signin error:", error);
//     res.status(500).json({
//       message: "Error during signin",
//       error: error.message,
//     });
//   }
// };

// // signInController.js
// exports.signin = async (req, res) => {
//   try {
//     const { email, password, googleAuth } = req.body;

//     if (googleAuth) {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res
//           .status(404)
//           .json({ message: "Google account not registered" });
//       }
//       if (!user.googleId) {
//         return res
//           .status(400)
//           .json({ message: "Please log in using email and password" });
//       }
//       const token = generateToken(user._id);
//       return res.status(200).json({
//         message: "Google login successful",
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         },
//         token,
//       });
//     }

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const token = generateToken(user._id);
//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Signin error:", error);
//     res
//       .status(500)
//       .json({ message: "Error during signin", error: error.message });
//   }
// };

const User = require("../../../models/adminSideSchema/loginSchema/userSchema");
const { generateToken } = require("../../../util/generateToken");
const bcrypt = require("bcryptjs");

exports.signin = async (req, res) => {
  try {
    const { email, password, googleAuth, name, googleId, picture } = req.body;

    if (googleAuth) {
      let user = await User.findOne({ email });

      // Create the user if it doesn't exist
      if (!user) {
        user = await User.create({
          email,
          name: name || "Google User",
          googleId,
          picture,
        });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        message: "Google login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    }

    // Email/password login
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res
      .status(500)
      .json({ message: "Error during signin", error: error.message });
  }
};
