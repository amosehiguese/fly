const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const db = require("../../db/connect");
const notificationService = require("../../utils/notificationService");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
  supplierIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");

// Upload configuration
const UPLOAD_DIR = path.join(__dirname, "../../uploads/dispute-chats");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create upload directory
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
})();

// File upload helper
const handleFileUpload = async (file) => {
  if (!file) return null;

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only images (JPEG, PNG, GIF) are allowed."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);

  await file.mv(filePath);
  return `/uploads/dispute-chats/${uniqueFilename}`;
};

// Message query template
const messageSelectQuery = `
  SELECT 
    d.message, 
    d.sender_type, 
    d.created_at AS time_sent,
    d.image_url,
    CASE d.sender_type 
      WHEN 'customer' THEN c.fullname 
      WHEN 'admin' THEN a.username 
    END AS sender_name,
    d.sender_id
  FROM dispute_chats d
  LEFT JOIN customers c ON d.sender_type = 'customer' AND d.sender_id = c.id
  LEFT JOIN admin a ON d.sender_type = 'admin' AND d.sender_id = a.id
  WHERE d.dispute_id = ?
  ORDER BY d.created_at ASC
`;

// Admin sends message
exports.adminSendMessage = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { dispute_id, message } = req.body;
      let imagePath = null;

      if (req.files?.image) {
        imagePath = await handleFileUpload(req.files.image);
      }

      // First validate dispute
      const [disputeResults] = await db
        .promise()
        .query("SELECT id FROM disputes WHERE id = ?", [dispute_id]);
      const dispute = disputeResults[0];

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Get supplier email
      const [supplierResults] = await db.promise().query(
        `SELECT s.email 
         FROM suppliers s
         JOIN bids b ON b.supplier_id = s.id
         JOIN disputes d ON d.bid_id = b.id
         WHERE d.id = ?`,
        [dispute_id]
      );
      const supplier = supplierResults[0];

      // Insert message
      const [result] = await db.promise().query(
        `INSERT INTO dispute_chats (dispute_id, sender_type, sender_id, message, image_url)
         VALUES (?, 'admin', ?, ?, ?)`,
        [dispute_id, req.admin.id, message, imagePath]
      );

      // Send notification to supplier
      if (supplier) {
        await notificationService.createNotification({
          recipientId: supplier.email,
          recipientType: "supplier",
          title: "Nytt Meddelande från Admin",
          message: `En administratör har skickat ett nytt meddelande angående tvist #${dispute_id}.`,
          type: "dispute_chat",
          referenceId: dispute_id,
          referenceType: "dispute",
        });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "SEND_DISPUTE_MESSAGE",
        `Sent message in dispute #${dispute_id}`,
        dispute_id,
        "dispute_chat"
      );

      res.status(201).json({
        message: "Message sent successfully.",
        chat_id: result.insertId,
        image_url: imagePath,
      });
    } catch (error) {
      console.error("Error sending admin message:", error);
      res
        .status(500)
        .json({ error: error.message || "Internal server error." });
    }
  },
];

// Customer sends message
exports.customerSendMessage = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const { dispute_id, message } = req.body;
      let imagePath = null;

      if (req.files?.image) {
        imagePath = await handleFileUpload(req.files.image);
      }

      // Validate dispute
      const [dispute] = await new Promise((resolve, reject) => {
        const query = `SELECT id, submitted_by FROM disputes WHERE id = ?`;
        db.query(query, [dispute_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      if (dispute.submitted_by !== req.user.id) {
        return res.status(403).json({
          error: "You are not authorized to access this dispute chat.",
        });
      }

      // Insert message
      const result = await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO dispute_chats (dispute_id, sender_type, sender_id, message, image_url)
          VALUES (?, 'customer', ?, ?, ?)
        `;
        db.query(
          query,
          [dispute_id, req.user.id, message, imagePath],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      // Notify admins
      const adminUsernames = await new Promise((resolve, reject) => {
        const query = `
          SELECT username 
          FROM admin 
          WHERE role IN ('super_admin', 'support_admin')
        `;
        db.query(query, [], (err, results) => {
          if (err) reject(err);
          if (!results || results.length === 0) {
            reject(new Error("No admin usernames found."));
          }
          resolve(results.map((row) => row.username));
        });
      });

      await Promise.all(
        adminUsernames.map((username) =>
          notificationService.createNotification({
            recipientId: username,
            recipientType: "admin",
            title: "New Message from Customer",
            message: `A customer has sent a new message regarding dispute #${dispute_id}.`,
            type: "dispute_chat",
            referenceId: dispute_id,
            referenceType: "dispute",
          })
        )
      );

      res.status(201).json({
        message: "Message sent successfully.",
        chat_id: result.insertId,
        image_url: imagePath,
      });
    } catch (error) {
      console.error("Error sending customer message:", error);
      if (error.message === "No admin usernames found.") {
        return res.status(500).json({
          error: "No admin available to notify. Please try again later.",
        });
      }
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// Get chat messages (general)
exports.getChatMessages = [
  async (req, res) => {
    try {
      const { dispute_id } = req.params;

      const [dispute] = await new Promise((resolve, reject) => {
        const query = `SELECT id FROM disputes WHERE id = ?`;
        db.query(query, [dispute_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      const messages = await new Promise((resolve, reject) => {
        db.query(messageSelectQuery, [dispute_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      res.json({
        message: "Chat messages fetched successfully.",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// Get customer chat messages
exports.getCustomerChatMessages = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const { dispute_id } = req.params;
      const limit = 10;

      // Fetch dispute details
      const [dispute] = await new Promise((resolve, reject) => {
        db.query(
          `SELECT d.id, d.submitted_by, b.order_id
           FROM disputes d
           JOIN bids b ON d.bid_id = b.id
           WHERE d.id = ?`,
          [dispute_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      if (dispute.submitted_by !== req.user.id) {
        return res.status(403).json({
          error: "You are not authorized to view this dispute chat.",
        });
      }

      // Fetch chat messages (latest 10)
      const messages = await new Promise((resolve, reject) => {
        db.query(
          `SELECT id, sender_type, sender_id, message, image_url, created_at, is_read 
           FROM dispute_chats 
           WHERE dispute_id = ? 
           ORDER BY created_at ASC 
           LIMIT ?`,
          [dispute_id, limit],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (messages.length > 0) {
        // Mark messages as read
        const messageIds = messages.map((msg) => msg.id);
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE dispute_chats SET is_read = TRUE WHERE id IN (?)`,
            [messageIds],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
      }

      res.json({
        message: "Chat messages fetched successfully.",
        data: messages,
        order_id: dispute.order_id,
      });
    } catch (error) {
      console.error("Error fetching customer chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// Get admin chat messages
exports.getAdminChatMessages = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { dispute_id } = req.params;
      const limit = 10;

      // Fetch dispute details
      const [dispute] = await new Promise((resolve, reject) => {
        db.query(
          `SELECT d.id, b.order_id
           FROM disputes d
           JOIN bids b ON d.bid_id = b.id
           WHERE d.id = ?`,
          [dispute_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Fetch chat messages (latest 10)
      const messages = await new Promise((resolve, reject) => {
        db.query(
          `SELECT id, sender_type, sender_id, message, image_url, created_at, is_read 
           FROM dispute_chats 
           WHERE dispute_id = ? 
           ORDER BY created_at ASC 
           LIMIT ?`,
          [dispute_id, limit],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (messages.length > 0) {
        // Mark messages as read
        const messageIds = messages.map((msg) => msg.id);
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE dispute_chats SET is_read = TRUE WHERE id IN (?)`,
            [messageIds],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
      }

      res.json({
        message: "Admin chat messages fetched successfully.",
        data: messages,
        order_id: dispute.order_id,
      });
    } catch (error) {
      console.error("Error fetching admin chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

//supplier chatting admin
exports.sendSupplierMessageToAdmin = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    try {
      const { dispute_id, message } = req.body;
      let imagePath = null;
      const senderId = req.user.id;
      const senderType = "supplier";

      if (req.files?.image) {
        imagePath = await handleFileUpload(req.files.image);
      }

      if (!dispute_id || (!message && !imagePath)) {
        return res.status(400).json({ error: "Message or image is required." });
      }

      // Ensure dispute exists
      const [dispute] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT id FROM disputes WHERE id = ?",
          [dispute_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Insert message into chat table
      const result = await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO admin_supplier_chat (dispute_id, sender_type, sender_id, message, image_url, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            dispute_id,
            senderType,
            senderId,
            message || null,
            imagePath || null,
          ],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      res.status(201).json({
        message: "Message sent successfully.",
        chat_id: result.insertId,
        image_url: imagePath,
      });
    } catch (error) {
      console.error("Error sending supplier message to admin:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// admin chatting supplier
exports.sendAdminMessageToSupplier = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { dispute_id, message } = req.body;
      let imagePath = null;
      const senderId = req.admin.id;
      const senderType = "admin";

      if (req.files?.image) {
        imagePath = await handleFileUpload(req.files.image);
      }

      if (!dispute_id || (!message && !imagePath)) {
        return res.status(400).json({ error: "Message or image is required." });
      }

      // Ensure dispute exists
      const [dispute] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT id FROM disputes WHERE id = ?",
          [dispute_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Insert message into chat table
      const result = await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO admin_supplier_chat (dispute_id, sender_type, sender_id, message, image_url, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            dispute_id,
            senderType,
            senderId,
            message || null,
            imagePath || null,
          ],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      res.status(201).json({
        message: "Message sent successfully.",
        chat_id: result.insertId,
        image_url: imagePath,
      });
    } catch (error) {
      console.error("Error sending admin message to supplier:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// View supplier messages
exports.getAdminSupplierChatMessages = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    try {
      const { dispute_id } = req.params;
      const { page = 1 } = req.query; // Default to page 1
      const limit = 10; // Fetch 10 messages at a time
      const offset = (page - 1) * limit;
      const userRole = req.user.role;
      const userId = req.user.id;

      if (!dispute_id) {
        return res.status(400).json({ error: "Dispute ID is required." });
      }

      // Ensure dispute exists and check supplier access
      const disputeResults = await new Promise((resolve, reject) => {
        db.query(
          `SELECT b.supplier_id FROM disputes d 
           JOIN bids b ON d.bid_id = b.id 
           WHERE d.id = ?`,
          [dispute_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      const dispute = disputeResults.length ? disputeResults[0] : null;

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      if (userRole === "supplier" && dispute.supplier_id !== userId) {
        return res
          .status(403)
          .json({ error: "You are not authorized to view this chat." });
      }

      // Fetch chat messages (limit 10 at a time)
      const messages = await new Promise((resolve, reject) => {
        db.query(
          `SELECT id, sender_type, sender_id, message, image_url, is_read, created_at 
           FROM admin_supplier_chat 
           WHERE dispute_id = ? 
           ORDER BY created_at ASC 
           LIMIT ? OFFSET ?`,
          [dispute_id, limit, offset],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      // Mark fetched messages as read
      if (messages.length > 0) {
        const messageIds = messages.map((msg) => msg.id);
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE admin_supplier_chat 
             SET is_read = TRUE 
             WHERE id IN (?)`,
            [messageIds],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
      }

      res.json({
        message: "Chat messages fetched successfully.",
        page: Number(page),
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// View admin messages
exports.getAdminViewSupplierChat = [
  authenticateJWT,
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { dispute_id } = req.params;
      const { page = 1 } = req.query; // Default to page 1
      const limit = 10;
      const offset = (page - 1) * limit;

      if (!dispute_id) {
        return res.status(400).json({ error: "Dispute ID is required." });
      }

      // Ensure dispute exists and get order_id + supplier_id
      const disputeResults = await new Promise((resolve, reject) => {
        db.query(
          `SELECT b.supplier_id, b.order_id 
           FROM disputes d 
           JOIN bids b ON d.bid_id = b.id 
           WHERE d.id = ?`,
          [dispute_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      const dispute = disputeResults.length ? disputeResults[0] : null;

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Fetch chat messages (limit 10 at a time)
      const messages = await new Promise((resolve, reject) => {
        db.query(
          `SELECT id, sender_type, sender_id, message, image_url, is_read, created_at 
           FROM admin_supplier_chat 
           WHERE dispute_id = ? 
           ORDER BY created_at ASC 
           LIMIT ? OFFSET ?`,
          [dispute_id, limit, offset],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      // Mark fetched messages as read
      if (messages.length > 0) {
        const messageIds = messages.map((msg) => msg.id);
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE admin_supplier_chat 
             SET is_read = TRUE 
             WHERE id IN (?)`,
            [messageIds],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
      }

      res.json({
        message: "Admin chat messages fetched successfully.",
        order_id: dispute.order_id,
        supplier_id: dispute.supplier_id,
        page: Number(page),
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching admin chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// updating resolution status
exports.updateDisputeResolution = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const {
        dispute_id,
        resolution_outcome,
        admin_comment,
        decision_taken,
        refunded_amount,
        status,
      } = req.body;

      if (!dispute_id) {
        return res.status(400).json({ error: "Dispute ID is required." });
      }

      // Ensure dispute exists
      const [dispute] = await db
        .promise()
        .query("SELECT id FROM disputes WHERE id = ?", [dispute_id]);

      if (!dispute.length) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Fetch the latest customer evidence from dispute_chats
      const [customerEvidenceResult] = await db.promise().query(
        `SELECT image_url FROM dispute_chats 
         WHERE dispute_id = ? AND image_url IS NOT NULL 
         ORDER BY created_at DESC LIMIT 1`,
        [dispute_id]
      );

      // Fetch the latest mover evidence from admin_supplier_chat
      const [moverEvidenceResult] = await db.promise().query(
        `SELECT image_url FROM admin_supplier_chat 
         WHERE dispute_id = ? AND image_url IS NOT NULL 
         ORDER BY created_at DESC LIMIT 1`,
        [dispute_id]
      );

      const customerEvidencePath = customerEvidenceResult.length
        ? customerEvidenceResult[0].image_url
        : null;
      const moverEvidencePath = moverEvidenceResult.length
        ? moverEvidenceResult[0].image_url
        : null;

      // Check if resolution already exists
      const [existingResolution] = await db
        .promise()
        .query("SELECT id FROM dispute_resolutions WHERE dispute_id = ?", [
          dispute_id,
        ]);

      if (existingResolution.length) {
        // Update existing resolution
        await db.promise().query(
          `UPDATE dispute_resolutions SET 
            resolution_outcome = ?, 
            admin_comment = ?, 
            customer_evidence = ?, 
            mover_evidence = ?, 
            decision_taken = ?, 
            refunded_amount = ?, 
            status = ?, 
            updated_at = NOW()
          WHERE dispute_id = ?`,
          [
            resolution_outcome || null,
            admin_comment || null,
            customerEvidencePath,
            moverEvidencePath,
            decision_taken || null,
            refunded_amount || 0,
            status || "pending",
            dispute_id,
          ]
        );
      } else {
        // Insert new resolution
        await db.promise().query(
          `INSERT INTO dispute_resolutions 
            (dispute_id, resolution_outcome, admin_comment, customer_evidence, mover_evidence, decision_taken, refunded_amount, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

          [
            dispute_id,
            resolution_outcome || null,
            admin_comment || null,
            customerEvidencePath,
            moverEvidencePath,
            decision_taken || null,
            refunded_amount || 0,
            status || "pending",
          ]
        );
      }

      res
        .status(200)
        .json({ message: "Dispute resolution updated successfully." });
    } catch (error) {
      console.error("Error updating dispute resolution:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

exports.getDisputeResolution = [
  authenticateJWT,
  async (req, res) => {
    try {
      const { dispute_id } = req.params;
      const userEmail = req.user.email; // Logged-in customer's email

      if (!dispute_id) {
        return res.status(400).json({ error: "Dispute ID is required." });
      }

      // Find the bid linked to the dispute
      const [dispute] = await db.promise().query(
        `SELECT b.quotation_id, b.quotation_type 
         FROM disputes d
         JOIN bids b ON d.bid_id = b.id
         WHERE d.id = ?`,
        [dispute_id]
      );

      if (!dispute.length) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      const { quotation_id, quotation_type } = dispute[0];

      // Validate the quotation_type against the known tables
      const validTables = [
        "private_move",
        "moving_cleaning",
        "heavy_lifting",
        "company_relocation",
        "estate_clearance",
        "evacuation_move",
        "secrecy_move",
      ];

      if (!validTables.includes(quotation_type)) {
        return res.status(400).json({ error: "Invalid quotation type." });
      }

      // Fetch customer email from the correct quotation table
      const [quotation] = await db
        .promise()
        .query(`SELECT email FROM ${quotation_type} WHERE id = ?`, [
          quotation_id,
        ]);

      if (!quotation.length) {
        return res.status(404).json({ error: "Quotation not found." });
      }

      // Check if the logged-in user is the customer who filed the dispute (using email)
      if (quotation[0].email !== userEmail) {
        return res.status(403).json({
          error: "You are not authorized to view this dispute resolution.",
        });
      }

      // Fetch dispute resolution details
      const [resolution] = await db
        .promise()
        .query(`SELECT * FROM dispute_resolutions WHERE dispute_id = ?`, [
          dispute_id,
        ]);

      if (!resolution.length) {
        return res
          .status(404)
          .json({ error: "Resolution not found for this dispute." });
      }

      res.json({
        message: "Dispute resolution fetched successfully.",
        data: resolution[0],
      });
    } catch (error) {
      console.error("Error fetching dispute resolution:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// Admin: Fetch all chats with a Supplier
exports.getAllAdminSupplierChats = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const query = `
        SELECT 
          d.id AS dispute_id,
          b.order_id,  
          d.status AS dispute_status,
          d.created_at AS dispute_created_at,
          s.company_name AS supplier_name,
          latest_chat.message AS latest_message,
          latest_chat.sender_type AS latest_sender,
          latest_chat.latest_message_time,
          (SELECT COUNT(*) FROM admin_supplier_chat WHERE dispute_id = d.id AND is_read = FALSE) AS unread_count
        FROM disputes d
        LEFT JOIN bids b ON d.bid_id = b.id  
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN (
          SELECT asc1.dispute_id, asc1.message, asc1.sender_type, asc1.created_at AS latest_message_time
          FROM admin_supplier_chat asc1
          INNER JOIN (
            SELECT dispute_id, MAX(created_at) AS latest_time
            FROM admin_supplier_chat
            GROUP BY dispute_id
          ) asc2 ON asc1.dispute_id = asc2.dispute_id AND asc1.created_at = asc2.latest_time
        ) latest_chat ON d.id = latest_chat.dispute_id
        ORDER BY latest_chat.latest_message_time DESC;
      `;

      const [results] = await db.promise().query(query);

      res.status(200).json({
        message: "All Admin-Supplier chats retrieved successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Admin: Fetch all chats with a Customer
exports.getAllAdminCustomerChats = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const query = `
        SELECT 
          d.id AS dispute_id,
          b.order_id,  
          d.status AS dispute_status,
          d.created_at AS dispute_created_at,
          (
            -- Use a correlated subquery to get exactly one customer name
            SELECT name FROM (
              SELECT id, name, 'private_move' AS type FROM private_move
              UNION ALL
              SELECT id, name, 'moving_cleaning' AS type FROM moving_cleaning
              UNION ALL
              SELECT id, name, 'heavy_lifting' AS type FROM heavy_lifting
              UNION ALL
              SELECT id, name, 'company_relocation' AS type FROM company_relocation
              UNION ALL
              SELECT id, name, 'estate_clearance' AS type FROM estate_clearance
              UNION ALL
              SELECT id, name, 'evacuation_move' AS type FROM evacuation_move
              UNION ALL
              SELECT id, name, 'secrecy_move' AS type FROM secrecy_move
            ) q 
            WHERE q.id = b.quotation_id AND q.type = b.quotation_type
            LIMIT 1
          ) AS customer_name,
          latest_chat.message AS latest_message,
          latest_chat.sender_type AS latest_sender,
          latest_chat.latest_message_time,
          (SELECT COUNT(*) FROM dispute_chats WHERE dispute_id = d.id AND is_read = FALSE) AS unread_count
        FROM disputes d
        LEFT JOIN bids b ON d.bid_id = b.id
        LEFT JOIN (
          SELECT dc1.dispute_id, dc1.message, dc1.sender_type, dc1.created_at AS latest_message_time
          FROM dispute_chats dc1
          INNER JOIN (
            SELECT dispute_id, MAX(created_at) AS latest_time
            FROM dispute_chats
            GROUP BY dispute_id
          ) dc2 ON dc1.dispute_id = dc2.dispute_id AND dc1.created_at = dc2.latest_time
        ) latest_chat ON d.id = latest_chat.dispute_id
        ORDER BY latest_chat.latest_message_time DESC;
      `;

      const [results] = await db.promise().query(query);

      res.status(200).json({
        message: "All Admin-Customer chats retrieved successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Suppliers: Fetch all their Disputes (with messages)
exports.getSupplierDisputesWithChats = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const user_id = req.user.id;

    try {
      const query = `
        SELECT 
          d.id AS dispute_id,
          b.order_id,  
          d.status AS dispute_status,
          d.created_at AS dispute_created_at,
          COALESCE(latest_chat.message, '') AS latest_message,
          COALESCE(latest_chat.sender_type, '') AS latest_sender,
          COALESCE(latest_chat.latest_message_time, d.created_at) AS latest_message_time,
          (SELECT COUNT(*) FROM admin_supplier_chat WHERE dispute_id = d.id AND is_read = FALSE) AS unread_count
        FROM disputes d
        LEFT JOIN bids b ON d.bid_id = b.id  
        LEFT JOIN (
          SELECT asc1.dispute_id, asc1.message, asc1.sender_type, asc1.created_at AS latest_message_time
          FROM admin_supplier_chat asc1
          WHERE asc1.created_at = (
            SELECT MAX(created_at) 
            FROM admin_supplier_chat 
            WHERE dispute_id = asc1.dispute_id
          ) 
        ) latest_chat ON d.id = latest_chat.dispute_id
        WHERE d.against = ? 
        ORDER BY latest_message_time DESC;
      `;

      const [results] = await db.promise().query(query, [user_id]);

      res.status(200).json({
        message: "Supplier disputes and latest chats retrieved successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error fetching supplier disputes:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// customers: Fetch all their Disputes (with messages)
exports.getCustomerDisputesWithChats = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const role = req.user.role;
    const user_id = req.user.id;

    try {
      console.log("Fetching disputes for user:", user_id, "Role:", role); // Debugging

      let query = `
        SELECT 
          d.id AS dispute_id,
          b.order_id,  
          d.status AS dispute_status,
          d.created_at AS dispute_created_at,
          COALESCE(latest_chat.message, '') AS latest_message,
          COALESCE(latest_chat.sender_type, '') AS latest_sender,
          COALESCE(latest_chat.latest_message_time, d.created_at) AS latest_message_time,
          COALESCE(unread_count.unread_messages, 0) AS unread_messages
        FROM disputes d
        LEFT JOIN bids b ON d.bid_id = b.id  
        LEFT JOIN (
          SELECT dc1.dispute_id, dc1.message, dc1.sender_type, dc1.created_at AS latest_message_time
          FROM dispute_chats dc1
          WHERE dc1.created_at = (
            SELECT MAX(created_at) 
            FROM dispute_chats 
            WHERE dispute_id = dc1.dispute_id
          )
        ) latest_chat ON d.id = latest_chat.dispute_id
        LEFT JOIN (
          SELECT dispute_id, COUNT(*) AS unread_messages
          FROM dispute_chats
          WHERE is_read = FALSE
          GROUP BY dispute_id
        ) unread_count ON d.id = unread_count.dispute_id
      `;

      let queryParams = [];

      if (role === "customer") {
        query += ` WHERE d.submitted_by = ?`;
        queryParams.push(user_id);
      } else if (role === "supplier") {
        query += ` WHERE d.against = ?`;
        queryParams.push(user_id);
      }

      query += ` ORDER BY latest_message_time DESC;`;

      const [results] = await db.promise().query(query, queryParams);

      console.log("Customer disputes result:", results); // Debugging

      res.status(200).json({
        message: "Customer disputes and latest chats fetched successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error fetching customer disputes:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.markMessagesAsRead = [
  authenticateJWT,
  async (req, res) => {
    const { dispute_id } = req.body;
    const user_id = req.user.id;
    const user_role = req.user.role;

    try {
      let tableName = "dispute_chats"; // Default for disputes

      // Ensure suppliers mark messages in `admin_supplier_chat`
      if (user_role === "supplier") {
        tableName = "admin_supplier_chat";
      }

      const updateQuery = `
        UPDATE ${tableName}
        SET is_read = TRUE
        WHERE dispute_id = ? AND sender_type != ? AND is_read = FALSE;
      `;

      await db.promise().query(updateQuery, [dispute_id, user_role]);

      res.status(200).json({
        message: "Messages marked as read successfully",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.markDisputeMessagesAsReadForAdmin = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    const { dispute_id } = req.body;

    try {
      // Update unread messages in both dispute-related tables
      const updateQuery = `
        UPDATE dispute_chats
        SET is_read = TRUE
        WHERE dispute_id = ? AND is_read = FALSE;
      `;

      const updateAdminSupplierChat = `
        UPDATE admin_supplier_chat
        SET is_read = TRUE
        WHERE dispute_id = ? AND is_read = FALSE;
      `;

      await db.promise().query(updateQuery, [dispute_id]);
      await db.promise().query(updateAdminSupplierChat, [dispute_id]);

      res.status(200).json({
        message: "All messages for this dispute marked as read by admin",
      });
    } catch (error) {
      console.error("Error marking dispute messages as read for admin:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
