const db = require("../../db/connect");
const notificationService = require("../../utils/notificationService");
const path = require("path");
const fs = require("fs").promises;
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

// Create upload directory if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, "../../uploads/review-evidence");
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
})();

// List of available quotation tables
const quotationTables = [
  "private_move",
  "moving_cleaning",
  "heavy_lifting",
  "company_relocation",
  "estate_clearance",
  "evacuation_move",
  "secrecy_move",
];

const submitReview = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const { order_id, rating, feedback_text } = req.body;

      if (!order_id || !rating || !feedback_text) {
        return res
          .status(400)
          .json({ error: "Order ID, rating, and feedback text are required." });
      }

      // Fetch bid details based on order_id
      const [bidResults] = await db.promise().query(
        `SELECT 
          b.id AS bid_id,
          b.order_id,
          b.quotation_type,
          b.supplier_id,
          b.quotation_id
         FROM bids b
         WHERE b.order_id = ?`,
        [order_id]
      );

      const [acceptedBidResults] = await db.promise().query(
        `
        SELECT
          ab.assignedDriverId
          from accepted_bids ab
          WHERE ab.order_id =?
        `,
        [order_id]
      );

      if (!acceptedBidResults) {
        return res
          .status(400)
          .json({ error: "no accepted bids for this order" });
      }

      if (!bidResults.length) {
        return res.status(404).json({ error: "No bid found for this order." });
      }

      const acceptedBids = acceptedBidResults[0];
      const bid = bidResults[0];

      // Validate if quotation_type exists in your 7 quotation tables
      const normalizedQuotationType = bid.quotation_type.toLowerCase().trim();

      if (!quotationTables.includes(normalizedQuotationType)) {
        return res.status(400).json({ error: "Invalid quotation type." });
      }

      // Dynamically determine the correct quotation table
      const quotationTable = normalizedQuotationType;

      // Fetch customer email from the correct quotation table
      const [quotationResults] = await db
        .promise()
        .query(
          `SELECT id AS customer_id, email AS customer_email FROM ?? WHERE id = ?`,
          [quotationTable, bid.quotation_id]
        );

      if (!quotationResults.length) {
        return res.status(404).json({ error: "Quotation not found." });
      }

      const { customer_id, customer_email } = quotationResults[0];

      // Ensure the logged-in user is the owner of the order (by email)
      if (customer_email !== req.user.email) {
        return res
          .status(403)
          .json({ error: "Unauthorized. You do not own this order." });
      }

      // Insert the review into the database
      const [reviewResult] = await db.promise().query(
        `INSERT INTO reviews (
          bid_id,
          order_id,
          quotation_type,
          supplier_id,
          driver_id,
          customer_id,
          rating,
          feedback_text,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          bid.bid_id,
          bid.order_id,
          bid.quotation_type,
          bid.supplier_id,
          acceptedBids.assignedDriverId,
          customer_id,
          rating,
          feedback_text,
        ]
      );

      res.status(201).json({
        message: "Review submitted successfully",
        messageSv: "Recension skickad framgångsrikt",
        reviewId: reviewResult.insertId,
        order_id: bid.order_id,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

const getReview = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const query = `
        SELECT 
          r.id AS review_id, 
          r.order_id, 
          r.bid_id, 
          r.quotation_type, 
          r.supplier_id, 
          s.company_name AS supplier_name, 
          r.customer_id, 
          r.driver_id, 
          d.full_name, 
          r.rating, 
          r.feedback_text, 
          r.created_at 
        FROM 
          reviews r 
          JOIN suppliers s ON r.supplier_id = s.id 
          JOIN drivers d ON r.driver_id = d.id 
        ORDER BY 
          r.created_at DESC;
      `;

      const [reviews] = await db.promise().query(query);

      if (!reviews.length) {
        return res.status(404).json({ error: "No reviews found." });
      }

      res.status(200).json({ reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

module.exports = {
  submitReview,
  getReview,
};
