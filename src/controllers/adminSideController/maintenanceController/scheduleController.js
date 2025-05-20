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

// ...existing code...

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { slots, date, startTime, endTime } = req.body;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { slots, date, startTime, endTime },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json(updatedSchedule);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update schedule",
      error: err.message,
    });
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete schedule",
      error: err.message,
    });
  }
};
