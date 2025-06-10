const express = require("express");
const {
  getDashboardStats,
  debugAppointments,
  cleanupDuplicates,
} = require("../../../controllers/adminSideController/dashboardController/dashboardStats.controller");

const router = express.Router();

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Debug endpoint to check appointments
router.get("/debug-appointments", debugAppointments);

// Cleanup duplicates endpoint
router.post("/cleanup-duplicates", cleanupDuplicates);

module.exports = router;
