// const User = require("../../../models/adminSideSchema/loginSchema/userSchema");
// const { generateToken } = require("../../../util/generateToken");
// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");

// // Register a new user
// exports.signup = async (req, res) => {
//   try {
//     console.log("Signup request body:", req.body);
//     const { name, email, password, confirmPassword } = req.body;

//     // Validate required fields
//     if (!name || !email || !password || !confirmPassword) {
//       return res.status(400).json({
//         message:
//           "All fields are required (name, email, password, confirmPassword)",
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     // Validate password format
//     const passwordRegex =
//       /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
//     if (!passwordRegex.test(password)) {
//       return res.status(400).json({
//         message:
//           "Password must be at least 8 characters and include letters, numbers, and special characters",
//       });
//     }

//     // Check password confirmation
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already exists with this email" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user with hashed password
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // Save user
//     const savedUser = await user.save();

//     // Generate token
//     const token = generateToken(savedUser._id);

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: savedUser._id,
//         name: savedUser.name,
//         email: savedUser.email,
//         role: savedUser.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({
//       message: "Error registering user",
//       error: error.message,
//     });
//   }
// };

// // Get all users - Admin only
// exports.getAllUsers = async (req, res) => {
//   try {
//     console.log("Fetching all users");
//     const users = await User.find({}).select("-password");
//     console.log(`Found ${users.length} users`);
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({
//       message: "Error fetching users",
//       error: error.message,
//     });
//   }
// };

// // Get user by ID
// exports.getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Fetching user by ID:", id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid user ID format" });
//     }

//     const user = await User.findById(id).select("-password");
//     if (!user) {
//       console.log("No user found with ID:", id);
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("User found:", user.email);
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({
//       message: "Error fetching user",
//       error: error.message,
//     });
//   }
// };

// // Update user
// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Updating user with ID:", id);
//     console.log("Update data:", req.body);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid user ID format" });
//     }

//     const updateData = { ...req.body };
//     if (updateData.password) {
//       const salt = await bcrypt.genSalt(10);
//       updateData.password = await bcrypt.hash(updateData.password, salt);
//     }

//     const user = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     if (!user) {
//       console.log("No user found to update with ID:", id);
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("User updated successfully:", user.email);
//     res.status(200).json({
//       message: "User updated successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({
//       message: "Error updating user",
//       error: error.message,
//     });
//   }
// };

// // Delete user
// exports.deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Deleting user with ID:", id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid user ID format" });
//     }

//     const user = await User.findById(id);
//     if (!user) {
//       console.log("No user found to delete with ID:", id);
//       return res.status(404).json({ message: "User not found" });
//     }

//     await User.findByIdAndDelete(id);
//     console.log("User deleted successfully:", user.email);
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).json({
//       message: "Error deleting user",
//       error: error.message,
//     });
//   }
// };

// signUpController.js
const User = require("../../../models/adminSideSchema/loginSchema/userSchema");
const { generateToken } = require("../../../util/generateToken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, googleAuth, picture } =
      req.body;

    if (googleAuth) {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name,
          email,
          googleId: email,
          picture: picture || null,
        });
        await user.save();
      }

      const token = generateToken(user._id);
      return res.status(201).json({
        message: "Google user registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    }

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message:
          "All fields are required (name, email, password, confirmPassword)",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include letters, numbers, and special characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    const token = generateToken(savedUser._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};
