const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }, // Only required if not using Google auth
    minlength: [8, "Password must be at least 8 characters"],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  picture: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["admin", "staff"],
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Remove password hashing middleware since we're handling it in the controller

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing passwords for user:", this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

module.exports = mongoose.model("User", userSchema);
