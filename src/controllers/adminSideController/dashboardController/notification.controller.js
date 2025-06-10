const Notification = require("../../../models/adminSideSchema/dashboard/notificationSchema");

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { type, userName, action, reference, status, details, read } =
      req.body;

    const notification = new Notification({
      type,
      userName,
      action,
      reference,
      status,
      details,
      read: read || false,
    });

    await notification.save();
    res
      .status(201)
      .json({ message: "Notification created successfully", notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create notification (API endpoint)
exports.createNotification = async (req, res) => {
  try {
    // Sanitize any HTML in the request body
    const sanitizedData = { ...req.body };

    if (sanitizedData.details) {
      sanitizedData.details = sanitizedData.details.replace(/<[^>]*>/g, "");
    }
    if (sanitizedData.action) {
      sanitizedData.action = sanitizedData.action.replace(/<[^>]*>/g, "");
    }
    if (sanitizedData.userName) {
      sanitizedData.userName = sanitizedData.userName.replace(/<[^>]*>/g, "");
    }
    if (sanitizedData.reference) {
      sanitizedData.reference = sanitizedData.reference.replace(/<[^>]*>/g, "");
    }
    if (sanitizedData.status) {
      sanitizedData.status = sanitizedData.status.replace(/<[^>]*>/g, "");
    }

    const notification = new Notification(sanitizedData);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create notification (internal function)
exports.createNotificationInternal = async (notificationData) => {
  try {
    // Sanitize any HTML in the notification data
    if (notificationData.details) {
      notificationData.details = notificationData.details.replace(
        /<[^>]*>/g,
        ""
      );
    }
    if (notificationData.action) {
      notificationData.action = notificationData.action.replace(/<[^>]*>/g, "");
    }
    if (notificationData.userName) {
      notificationData.userName = notificationData.userName.replace(
        /<[^>]*>/g,
        ""
      );
    }
    if (notificationData.reference) {
      notificationData.reference = notificationData.reference.replace(
        /<[^>]*>/g,
        ""
      );
    }
    if (notificationData.status) {
      notificationData.status = notificationData.status.replace(/<[^>]*>/g, "");
    }

    const notification = new Notification(notificationData);
    return await notification.save();
  } catch (error) {
    console.error("Error creating notification internally:", error);
    return null;
  }
};
