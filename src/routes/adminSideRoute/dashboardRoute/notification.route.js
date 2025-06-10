const express = require("express");
const router = express.Router();
const notificationController = require("../../../controllers/adminSideController/dashboardController/notification.controller");

// Get all notifications
router.get("/", notificationController.getNotifications);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.put("/mark-read/:id", notificationController.markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", notificationController.markAllAsRead);

// Create notification (for testing purposes)
router.post("/", notificationController.createNotification);

// Create notification (alternative endpoint)
router.post("/create", notificationController.createNotification);

module.exports = router;
