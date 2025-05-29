const Status = require("../../../models/adminSideSchema/dashboard/statusSchema");

// Initialize stats object with uppercase status values to match the frontend
const dashboardStats = {
  APPROVED: 0,
  PENDING: 0,
  COMPLETED: 0,
  REJECTED: 0,
  total: 0,
  morning: {
    APPROVED: 0,
    PENDING: 0,
    COMPLETED: 0,
    REJECTED: 0,
  },
  afternoon: {
    APPROVED: 0,
    PENDING: 0,
    COMPLETED: 0,
    REJECTED: 0,
  },
};

const getDashboardStats = async (req, res) => {
  try {
    // Get all statuses
    const statuses = await Status.find({});

    // Initialize counters with uppercase status values
    const stats = {
      APPROVED: 0,
      PENDING: 0,
      COMPLETED: 0,
      REJECTED: 0,
      total: 0,
      morning: {
        APPROVED: 0,
        PENDING: 0,
        COMPLETED: 0,
        REJECTED: 0,
      },
      afternoon: {
        APPROVED: 0,
        PENDING: 0,
        COMPLETED: 0,
        REJECTED: 0,
      },
    };

    // Count statuses
    statuses.forEach((status) => {
      // Keep status in uppercase to match frontend values
      const statusType = status.status || "PENDING";
      const timeSlot = status.timeSlot?.toLowerCase() || "";

      // Only count if it's one of our known status types
      if (stats.hasOwnProperty(statusType)) {
        // Increment total counter for the status type
        stats[statusType]++;
        stats.total++;

        // Increment time-specific counter
        if (timeSlot.includes("morning")) {
          stats.morning[statusType]++;
        } else if (timeSlot.includes("afternoon")) {
          stats.afternoon[statusType]++;
        }
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      message: "Error getting dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
