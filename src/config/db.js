// src/config/db.js
const mongoose = require("mongoose");
require("dotenv").config(); // Good to have here to ensure MONGO_URI is loaded

const connectDB = async () => {
  try {
    // mongoose.connect already returns a promise, so await works directly
    // For Mongoose v6 and later, useNewUrlParser, useUnifiedTopology,
    // useFindAndModify, and useCreateIndex are no longer necessary options as they are default.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully..."); // More descriptive log
  } catch (err) {
    console.error("MongoDB connection failed:", err.message); // Log the error message
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;