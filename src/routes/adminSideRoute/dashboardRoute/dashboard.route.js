const express = require("express");
const {
  getDashboardStats,
  debugAppointments,
  cleanupDuplicates,
} = require("../../../controllers/adminSideController/dashboardController/dashboardStats.controller");

const router = express.Router();

// Get dashboard statistics with morning/afternoon breakdown
// Returns: { APPROVED: 0, PENDING: 0, COMPLETED: 0, REJECTED: 0, total: 0, morning: {...}, afternoon: {...}, timeSlots: {...} }
router.get("/stats", getDashboardStats);

// Debug endpoint to check appointments (returns sample of appointment records)
// Returns: { total: number, sample: [...] }
router.get("/debug-appointments", debugAppointments);

// Cleanup duplicates endpoint (removes duplicate appointment records - use with caution)
// Returns: { message: string, totalRecordsBefore: number, duplicatesRemoved: number, ... }
router.post("/cleanup-duplicates", cleanupDuplicates);

module.exports = router;
