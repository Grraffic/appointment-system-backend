const Schedule = require("../../../models/adminSideSchema/maintenanceSchema/scheduleSchema");

// @desc    Create a new schedule
// @route   POST /api/schedules
exports.createSchedule = async (req, res) => {
  try {
    const { slots, date, startTime, endTime } = req.body;

    const newSchedule = new Schedule({ slots, date, startTime, endTime });
    const savedSchedule = await newSchedule.save();

    res.status(201).json(savedSchedule);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create schedule", error: err.message });
  }
};

// @desc    Get all schedules
// @route   GET /api/schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1 });
    res.status(200).json(schedules);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve schedules", error: err.message });
  }
};
