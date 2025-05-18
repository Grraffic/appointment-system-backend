const express = require("express");
const router = express.Router();
const scheduleController = require("../../../controllers/adminSideController/maintenanceController/scheduleController");

// Create a new schedule
router.post("/", scheduleController.createSchedule);

// Get all schedules
router.get("/", scheduleController.getAllSchedules);

module.exports = router;
