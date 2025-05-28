const Schedule = require("../../../models/adminSideSchema/maintenanceSchema/scheduleSchema");

// Helper function to format time with AM/PM
const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to validate date
const validateDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  if (inputDate < today) {
    throw new Error("Schedule date cannot be in the past");
  }
  return inputDate;
};

// @desc    Create a new schedule
// @route   POST /api/schedules
exports.createSchedule = async (req, res) => {
  try {
    const { slots, date, startTime, endTime } = req.body;

    // Validate date
    const validDate = validateDate(date);

    // Format times with AM/PM
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const newSchedule = new Schedule({ 
      slots, 
      date: validDate, 
      startTime: formattedStartTime, 
      endTime: formattedEndTime 
    });
    const savedSchedule = await newSchedule.save();

    res.status(201).json(savedSchedule);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Failed to create schedule", error: err.message });
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

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { slots, date, startTime, endTime } = req.body;

    // Validate date
    const validDate = validateDate(date);

    // Format times with AM/PM
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { 
        slots, 
        date: validDate, 
        startTime: formattedStartTime, 
        endTime: formattedEndTime 
      },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json(updatedSchedule);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Failed to update schedule",
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
