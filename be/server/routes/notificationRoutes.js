const express = require("express");
const {
  getCustomerNotifications,
  getAdminNotifications,
  getSupplierNotifications,
} = require("../controllers/notificationController");

const {
  markNotificationsAsRead,
  markNotificationAsReadById,
} = require("../controllers/notificationRead");
const {authenticateJWT} = require("../controllers/loginController/authMiddleware");

const router = express.Router();

router.get("/customer", getCustomerNotifications);
router.get("/admin", getAdminNotifications);
router.get("/supplier", getSupplierNotifications);

// Route to mark notifications as read
router.patch("/read", authenticateJWT, markNotificationsAsRead);

// Route to mark a single notification as read by its ID
router.patch(
  "/read/:notification_id",
  authenticateJWT,
  markNotificationAsReadById
);

module.exports = router;
