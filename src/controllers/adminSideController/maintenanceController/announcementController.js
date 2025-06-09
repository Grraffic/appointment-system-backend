const Announcement = require("../../../models/adminSideSchema/maintenanceSchema/announcementSchema");
const mongoose = require("mongoose");

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createAnnouncement = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Please provide title and description" });
  }
  try {
    const announcement = await Announcement.create({ title, description });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const updateAnnouncement = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "No such announcement" });
  }

  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteAnnouncement = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "No such announcement" });
  }

  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({
      id: req.params.id,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
