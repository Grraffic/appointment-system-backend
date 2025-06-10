const express = require("express");
const {
  getDashboardStats,
  debugAppointments,
} = require("../../../controllers/adminSideController/dashboardController/dashboardStats.controller");

const router = express.Router();

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Debug endpoint to check appointments
router.get("/debug-appointments", debugAppointments);

module.exports = router;
