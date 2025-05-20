const express = require("express");
const router = express.Router();
const scheduleController = require("../../../controllers/adminSideController/maintenanceController/scheduleController");

// Create a new schedule
router.post("/", scheduleController.createSchedule);

// Get all schedules
router.get("/", scheduleController.getAllSchedules);

// Update a schedule
router.put("/:id", scheduleController.updateSchedule);

// Delete a schedule
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
