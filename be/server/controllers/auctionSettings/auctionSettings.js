const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../../utils/notificationService");
const emailService = require("../../../utils/emailService");
const { format, differenceInCalendarMonths, addMonths } = require("date-fns");
const { check, validationResult } = require("express-validator");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");

exports.updateAuctionSettings = [
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const {
        moving_cost_percentage,
        additional_services_percentage,
        cost_of_truck,
        auction_duration_minutes,
        auction_secondary_duration_minutes,
        high_value_bid_threshold,
      } = req.body;

      if (
        moving_cost_percentage === undefined ||
        additional_services_percentage === undefined ||
        cost_of_truck === undefined ||
        auction_duration_minutes === undefined ||
        auction_secondary_duration_minutes === undefined ||
        high_value_bid_threshold === undefined
      ) {
        return res.status(400).json({
          error: "All auction settings fields are required.",
        });
      }

      await db.promise().query(
        `UPDATE settings 
         SET moving_cost_percentage = ?, 
             additional_services_percentage = ?, 
             cost_of_truck = ?, 
             auction_duration_minutes = ?, 
             auction_secondary_duration_minutes = ?,
             high_value_bid_threshold = ?`,
        [
          moving_cost_percentage,
          additional_services_percentage,
          cost_of_truck,
          auction_duration_minutes,
          auction_secondary_duration_minutes,
          high_value_bid_threshold,
        ]
      );

      res
        .status(200)
        .json({ message: "Auction settings updated successfully." });
    } catch (error) {
      console.error("Error updating auction settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
