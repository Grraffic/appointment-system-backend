// const signUpSchema = require("../../../models/adminSideSchema/login/signUpSchema");
const generateToken = require("../../../util/generateToken");
const User = require("../../../models/loginSchema/userSchema");

// @route  POST /api/auth/signup
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received:", name, email, password);

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(409).json({ message: "Email already exists" });
    }

    // Create a new user
    const newUser = new signUpSchema({ name, email, password });
    await newUser.save();

    console.log("User saved:", newUser);

    // Generate a token
    const token = generateToken(newUser._id);
    res.status(201).json({
      message: "User registered",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

module.exports = {
  signup,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
