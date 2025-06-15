const Status = require("../../../models/adminSideSchema/dashboard/statusSchema");

const getDashboardStats = async (req, res) => {
  try {
    console.log("=== DASHBOARD STATS DEBUG ===");

    // SIMPLIFIED APPROACH: Get all statuses (no month filtering for now)
    const statuses = await Status.find({});
    console.log(`Found ${statuses.length} total appointments in database`);

    // Log all appointments for debugging
    console.log(
      "All appointments:",
      statuses.map((s) => ({
        transactionNumber: s.transactionNumber,
        status: s.status,
        timeSlot: s.timeSlot,
        appointmentDate: s.appointmentDate,
        dateOfRequest: s.dateOfRequest,
      }))
    );

    // Initialize counters with uppercase status values and time slots
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
      timeSlots: {}, // Dynamic object to store time slot breakdowns
    };

    // ENHANCED COUNTING - With AM/PM detection
    statuses.forEach((status) => {
      const statusType = status.status || "PENDING";
      const timeSlot = status.timeSlot || "";

      console.log(
        `Processing: ${status.transactionNumber} | Status: ${statusType} | TimeSlot: "${timeSlot}"`
      );

      // Count total for this status
      if (stats.hasOwnProperty(statusType)) {
        stats[statusType]++;
        stats.total++;

        // Determine if it's morning or afternoon using your improved logic
        const isAM =
          timeSlot.toUpperCase().includes("AM") ||
          timeSlot.toUpperCase().includes("MORNING");
        const isPM =
          timeSlot.toUpperCase().includes("PM") ||
          timeSlot.toUpperCase().includes("AFTERNOON");

        console.log(`  -> AM check: ${isAM}, PM check: ${isPM}`);

        if (isAM) {
          stats.morning[statusType]++;
          console.log(
            `  -> ✅ Added to MORNING ${statusType} (count now: ${stats.morning[statusType]})`
          );
        } else if (isPM) {
          stats.afternoon[statusType]++;
          console.log(
            `  -> ✅ Added to AFTERNOON ${statusType} (count now: ${stats.afternoon[statusType]})`
          );
        } else {
          console.log(`  -> ❌ TimeSlot "${timeSlot}" not recognized as AM/PM`);
          console.log(
            `  -> Debug: toUpperCase="${timeSlot.toUpperCase()}", includes AM=${timeSlot
              .toUpperCase()
              .includes("AM")}, includes PM=${timeSlot
              .toUpperCase()
              .includes("PM")}`
          );
        }

        // Group by actual time slot that user selected
        const actualTimeSlot = timeSlot || "No time specified";

        // Initialize time slot object if it doesn't exist
        if (!stats.timeSlots[actualTimeSlot]) {
          stats.timeSlots[actualTimeSlot] = {
            APPROVED: 0,
            PENDING: 0,
            COMPLETED: 0,
            REJECTED: 0,
            total: 0,
          };
        }

        // Add to the specific time slot
        stats.timeSlots[actualTimeSlot][statusType]++;
        stats.timeSlots[actualTimeSlot].total++;

        console.log(
          `  -> Added to time slot "${actualTimeSlot}" for ${statusType}`
        );
      }
    });

    // Ensure morning and afternoon objects are always included in response
    const finalStats = {
      APPROVED: stats.APPROVED || 0,
      PENDING: stats.PENDING || 0,
      COMPLETED: stats.COMPLETED || 0,
      REJECTED: stats.REJECTED || 0,
      total: stats.total || 0,
      morning: {
        APPROVED: stats.morning?.APPROVED || 0,
        PENDING: stats.morning?.PENDING || 0,
        COMPLETED: stats.morning?.COMPLETED || 0,
        REJECTED: stats.morning?.REJECTED || 0,
      },
      afternoon: {
        APPROVED: stats.afternoon?.APPROVED || 0,
        PENDING: stats.afternoon?.PENDING || 0,
        COMPLETED: stats.afternoon?.COMPLETED || 0,
        REJECTED: stats.afternoon?.REJECTED || 0,
      },
      timeSlots: stats.timeSlots || {},
    };

    console.log("Final stats with morning/afternoon:", finalStats);
    res.status(200).json(finalStats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      message: "Error getting dashboard statistics",
      error: error.message,
    });
  }
};

// Debug endpoint to check all appointments
const debugAppointments = async (req, res) => {
  try {
    const allStatuses = await Status.find({}).limit(10);
    const debugInfo = allStatuses.map((status) => ({
      transactionNumber: status.transactionNumber,
      status: status.status,
      appointmentDate: status.appointmentDate,
      dateOfRequest: status.dateOfRequest,
      timeSlot: status.timeSlot,
      emailAddress: status.emailAddress,
    }));

    res.status(200).json({
      total: await Status.countDocuments({}),
      sample: debugInfo,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: error.message });
  }
};

// Cleanup duplicates endpoint
const cleanupDuplicates = async (req, res) => {
  try {
    console.log("Starting duplicate cleanup...");

    // Find all status records
    const allStatuses = await Status.find({}).sort({ dateOfRequest: -1 });
    console.log(`Found ${allStatuses.length} total status records`);

    let duplicatesRemoved = 0;
    let orphanedRemoved = 0;
    const duplicateInfo = [];
    const orphanedInfo = [];

    // First, remove orphaned records with ObjectId transactionNumbers (from document requests)
    for (const status of allStatuses) {
      const transactionNumber = status.transactionNumber;

      // Check if transactionNumber looks like an ObjectId (24 hex characters)
      if (
        transactionNumber &&
        transactionNumber.length === 24 &&
        /^[0-9a-fA-F]{24}$/.test(transactionNumber)
      ) {
        console.log(
          `Found orphaned ObjectId transaction: ${transactionNumber}`
        );
        orphanedInfo.push({
          id: status._id.toString(),
          transactionNumber: transactionNumber,
          emailAddress: status.emailAddress,
          dateOfRequest: status.dateOfRequest,
        });

        await Status.findByIdAndDelete(status._id);
        orphanedRemoved++;
      }
    }

    // Get remaining status records after orphan cleanup
    const remainingStatuses = await Status.find({}).sort({ dateOfRequest: -1 });

    // Group remaining records by transactionNumber
    const groupedByTransaction = {};
    remainingStatuses.forEach((status) => {
      if (!groupedByTransaction[status.transactionNumber]) {
        groupedByTransaction[status.transactionNumber] = [];
      }
      groupedByTransaction[status.transactionNumber].push(status);
    });

    // Find duplicates and remove older ones
    for (const [transactionNumber, statuses] of Object.entries(
      groupedByTransaction
    )) {
      if (statuses.length > 1) {
        console.log(
          `Found ${statuses.length} duplicates for transaction ${transactionNumber}`
        );

        // Keep the most recent one (first in sorted array)
        const toKeep = statuses[0];
        const toRemove = statuses.slice(1);

        duplicateInfo.push({
          transactionNumber,
          totalFound: statuses.length,
          kept: toKeep._id.toString(),
          removed: toRemove.map((s) => s._id.toString()),
        });

        // Remove the duplicates
        for (const duplicate of toRemove) {
          await Status.findByIdAndDelete(duplicate._id);
          duplicatesRemoved++;
        }
      }
    }

    res.status(200).json({
      message: "Cleanup completed",
      totalRecordsBefore: allStatuses.length,
      orphanedRemoved,
      duplicatesRemoved,
      totalRecordsAfter:
        allStatuses.length - orphanedRemoved - duplicatesRemoved,
      orphanedInfo,
      duplicateInfo,
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({
      message: "Error during cleanup",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  debugAppointments,
  cleanupDuplicates,
};
