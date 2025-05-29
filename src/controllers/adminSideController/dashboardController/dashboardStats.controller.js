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
    }; // Count statuses
    statuses.forEach((status) => {
      // Keep status in uppercase to match frontend values
      const statusType = status.status || "PENDING";
      const timeSlot = status.timeSlot?.toLowerCase() || "";

      // Special handling for COMPLETED status
      // If an appointment is COMPLETED, it means it was also APPROVED before
      if (statusType === "COMPLETED") {
        // Count in both COMPLETED and APPROVED
        stats.COMPLETED++;
        stats.APPROVED++;
        if (timeSlot.includes("morning")) {
          stats.morning.COMPLETED++;
          stats.morning.APPROVED++;
        } else if (timeSlot.includes("afternoon")) {
          stats.afternoon.COMPLETED++;
          stats.afternoon.APPROVED++;
        }
      }
      // For other statuses, count normally
      else if (stats.hasOwnProperty(statusType)) {
        stats[statusType]++;
        if (timeSlot.includes("morning")) {
          stats.morning[statusType]++;
        } else if (timeSlot.includes("afternoon")) {
          stats.afternoon[statusType]++;
        }
      }

      // Increment total for all valid statuses
      if (stats.hasOwnProperty(statusType)) {
        stats.total++;
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
