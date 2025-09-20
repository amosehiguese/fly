const db = require('../../db/connect');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const notificationService = require('../../utils/notificationService');
const { authenticateJWT, userIsLoggedIn } = require("../controllers/loginController/authMiddleware");

// Create upload directory if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, '../../uploads/disputes');
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating disputes upload directory:', error);
  }
})();



exports.createDispute = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const { order_id, reason, request_details, desired_resolution } = req.body;

      // Validate required fields
      if (!order_id || !reason || !request_details || !desired_resolution) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if order exists and fetch related data
      const [bids] = await db
        .promise()
        .query(
          `
          SELECT 
            b.id AS bid_id, 
            b.order_id, 
            b.quotation_type, 
            b.quotation_id, 
            b.supplier_id, 
            b.status,
            s.email AS supplier_email,
            s.company_name AS supplier_name
          FROM bids b
          JOIN suppliers s ON b.supplier_id = s.id
          WHERE b.order_id = ? AND b.status = 'approved'
        `,
          [order_id]
        );

      if (bids.length === 0) {
        return res.status(404).json({ error: "Order not found or not approved" });
      }

      const bid = bids[0];

      // Check if a dispute already exists for this bid
      const [existingDisputes] = await db
        .promise()
        .query(`SELECT id FROM disputes WHERE bid_id = ?`, [bid.bid_id]);

      if (existingDisputes.length > 0) {
        return res.status(400).json({ error: "A dispute for this order has already been filed." });
      }

      // Handle file uploads
      let images = [];
      if (req.files && req.files.images) {
        const uploadedFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for (const file of uploadedFiles) {
          const uniqueFilename = `${req.user.email}_${uuidv4()}${path.extname(file.name)}`;
          const filePath = path.join(UPLOAD_DIR, uniqueFilename);

          await file.mv(filePath);
          images.push(`/uploads/disputes/${uniqueFilename}`);
        }
      }

      // Insert dispute into the database
      const [result] = await db.promise().query(
        `
        INSERT INTO disputes 
        (bid_id, submitted_by, against, reason, request_details, images, desired_resolution)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [bid.bid_id, req.user.id, bid.supplier_id, reason, request_details, JSON.stringify(images), desired_resolution]
      );

      // Notify admins about the new dispute
      await notificationService.notifyAdmin({
        title: "New Dispute Submitted",
        message: `Dispute submitted for order ${bid.order_id} by ${req.user.email}`,
        type: "dispute",
        referenceId: result.insertId,
        referenceType: "disputes",
      });

      res.status(201).json({
        message: "Dispute created successfully",
        dispute_id: result.insertId,
        order_id: bid.order_id,
      });
    } catch (error) {
      console.error("Error creating dispute:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.getUserDisputes = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const disputes = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            d.id AS dispute_id,
            d.reason,
            d.request_details,
            d.status,
            d.created_at,
            b.quotation_type,
            s.company_name AS supplier_name,
            c.fullname AS submitted_by,
            d.images,
            d.desired_resolution,
            b.order_id
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id
          JOIN suppliers s ON b.supplier_id = s.id
          JOIN customers c ON d.submitted_by = c.id
          WHERE d.submitted_by = ? -- Filter by logged-in user's ID
          ORDER BY d.created_at DESC
        `;

        db.query(query, [userId], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!disputes.length) {
        return res.status(404).json({ message: 'No disputes found.' });
      }

      const processedDisputes = disputes.map((dispute) => ({
        ...dispute,
        images: dispute.images ? JSON.parse(dispute.images) : [], // Ensure images are parsed properly
      }));

      res.json({
        message: 'Disputes fetched successfully.',
        data: processedDisputes,
      });
    } catch (error) {
      console.error('Error fetching disputes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];

exports.getDisputeById = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    try {
      const disputeId = req.params.id;
      const userId = req.user.id;

      const [dispute] = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            d.id AS dispute_id,
            d.reason,
            d.request_details,
            d.status,
            d.created_at,
            b.quotation_type,
            ab.final_price AS transaction_amount,
            s.company_name AS supplier_name,
            s.id as supplier_id,
            c.fullname AS submitted_by,
            c.id as customer_id,
            d.images,
            d.desired_resolution,
            b.order_id
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id
          JOIN accepted_bids ab ON ab.bid_id = b.id -- Fetch final_price from accepted_bids
          JOIN suppliers s ON b.supplier_id = s.id
          JOIN customers c ON d.submitted_by = c.id
          WHERE d.id = ? AND d.submitted_by = ? -- Ensure the dispute belongs to the logged-in user
        `;

        db.query(query, [disputeId, userId], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!dispute) {
        return res.status(404).json({ error: 'Dispute not found' });
      }

      dispute.images = dispute.images ? JSON.parse(dispute.images) : [];

      res.json({
        message: 'Dispute details fetched successfully.',
        data: dispute,
      });
    } catch (error) {
      console.error('Error fetching dispute:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];







