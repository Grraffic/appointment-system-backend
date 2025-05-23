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

// Auth routes
router.use("/signup", require("./adminSideRoute/loginRoute/signUpRoute"));
router.use("/signin", require("./adminSideRoute/loginRoute/signInRoute"));

// Other routes
router.use("/contact", require("./contactFormRoute"));
router.use("/students", require("./appointmentRoute/studentRoute"));
router.use(
  "/document-requests",
  require("./appointmentRoute/documentRequestRoute")
);
router.use("/bookings", require("./appointmentRoute/bookingRoutes"));

router.use("/attachment", require("./appointmentRoute/attachmentRoute")); // ✅ IMPORTANT
router.use(
  "/schedules",
  require("./adminSideRoute/maintenanceRoute/scheduleRoute")
);

router.use("/holidays", require("./adminSideRoute/holiday.router"));
router.use("/events", require("./adminSideRoute/event.router"));
// Add email verification route
router.get("/verify/:token", require("./adminSideRoute/loginRoute/authRoutes"));
module.exports = router;
