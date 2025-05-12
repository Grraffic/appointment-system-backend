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
router.use("/signup", require("./loginRoute/signUpRoute"));
// router.use("/signin", require("./loginRoute/signInRoute"));
router.use("/document-requests", require("./appointmentRoute/studentRoute"));

module.exports = router;
