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

router.use("/contact", require("./contactFormRoute"));
router.use("/students", require("./appointmentRoute/studentRoute"));
router.use(
  "/document-requests",
  require("./appointmentRoute/documentRequestRoute")
);
router.use("/bookings", require("./appointmentRoute/bookingRoutes"));

router.use("/attachment", require("./appointmentRoute/attachmentRoute")); // ✅ IMPORTANT
router.use("/signup", require("./adminSideRoute/loginRoute/signUpRoute"));
router.use(
  "/schedules",
  require("./adminSideRoute/maintenanceRoute/scheduleRoute")
);

module.exports = router;
