const express = require("express");
const {
  getDashboardStats,
} = require("../../../controllers/adminSideController/dashboardController/dashboardStats.controller");

const router = express.Router();

// Get dashboard statistics
router.get("/stats", getDashboardStats);

module.exports = router;
