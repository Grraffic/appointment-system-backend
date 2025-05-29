// const express = require("express");
// const router = express.Router();

// // Mounts contactForm route under /contact
// router.use("/contact", require("./contactForm"));

// // Mounts schedule route under /schedule
// // router.use("/schedule", require("./adminSide/schedule"));

// module.exports = router;

// routes/index.js
const express = require("express");
const router = express.Router();

// Import routes
const authRoutes = require("./adminSideRoute/loginRoute/authRoutes");
const signUpRoute = require("./adminSideRoute/loginRoute/signUpRoute");
const signInRoute = require("./adminSideRoute/loginRoute/signInRoute");
const forgotPasswordRoute = require("./adminSideRoute/loginRoute/forgotPasswordRoute");
const userProfileRoute = require("./userProfileRoute");
const contactFormRoute = require("./contactFormRoute");
const documentRequestRoute = require("./appointmentRoute/documentRequestRoute");
const attachmentRoute = require("./appointmentRoute/attachmentRoute");
const statusRoute = require("./appointmentRoute/statusRoute");
const dashboardRoute = require("./adminSideRoute/dashboardRoute/dashboard.route");

// Auth routes
router.use("/signup", signUpRoute);
router.use("/signin", signInRoute);
router.use("/forgot-password", forgotPasswordRoute);

// Other routes
router.use("/users", userProfileRoute);
router.use("/contact", contactFormRoute);
router.use("/students", require("./appointmentRoute/studentRoute"));
router.use("/document-requests", documentRequestRoute);
router.use("/bookings", require("./appointmentRoute/bookingRoutes"));
router.use("/attachment", attachmentRoute);
router.use(
  "/schedules",
  require("./adminSideRoute/maintenanceRoute/scheduleRoute")
);
router.use("/holidays", require("./adminSideRoute/holiday.router"));
router.use("/events", require("./adminSideRoute/event.router"));
router.use("/status", require("./appointmentRoute/statusRoute"));
router.use("/feedback", require("./appointmentRoute/feedbackRoute"));
router.use("/dashboard", dashboardRoute);
// Add email verification route
router.get("/verify/:token", require("./adminSideRoute/loginRoute/authRoutes"));
module.exports = router;
