const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const db = require("../../db/connect");
const notificationService = require("../../utils/notificationService");
const { authenticateJWT, supplierIsLoggedIn , userIsLoggedIn, logAdminActivity, checkRole } = require("../controllers/loginController/authMiddleware");

// Upload configuration
const UPLOAD_DIR = path.join(__dirname, "../../uploads/supplier-chats");
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
  return `/uploads/supplier-chats/${uniqueFilename}`;
};





// Message query template for supplier chats
const messageSelectQuery = `
  SELECT 
    sc.message, 
    sc.sender_type, 
    sc.created_at AS time_sent,
    sc.image_url,
    CASE sc.sender_type 
      WHEN 'supplier' THEN s.company_name 
      WHEN 'admin' THEN a.username 
    END AS sender_name,
    sc.sender_id
  FROM supplier_chats sc
  LEFT JOIN suppliers s ON sc.sender_type = 'supplier' AND sc.sender_id = s.id
  LEFT JOIN admin a ON sc.sender_type = 'admin' AND sc.sender_id = a.id
  WHERE sc.dispute_id = ?
  ORDER BY sc.created_at ASC
`;

// Admin sends message to supplier
exports.adminSendMessage = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { dispute_id, message } = req.body;
      let imagePath = null;

      if (req.files?.image) {
        imagePath = await handleFileUpload(req.files.image);
      }

      // Validate dispute
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

      // Get supplier email
      const [supplier] = await new Promise((resolve, reject) => {
        const query = `
          SELECT s.email 
          FROM suppliers s
          JOIN bids b ON b.supplier_id = s.id
          JOIN disputes d ON d.bid_id = b.id
          WHERE d.id = ?
        `;
        db.query(query, [dispute_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      // Insert message
      const result = await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO supplier_chats (dispute_id, sender_type, sender_id, message, image_url)
          VALUES (?, 'admin', ?, ?, ?)
        `;
        db.query(
          query,
          [dispute_id, req.admin.id, message, imagePath],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      // Notify supplier
      if (supplier) {
        await notificationService.createNotification({
          recipientId: supplier.email,
          recipientType: "supplier",
          title: "New Message from Admin",
          message: `An admin has sent a new message regarding dispute #${dispute_id}.`,
          type: "supplier_chat",
          referenceId: dispute_id,
          referenceType: "dispute",
        });
      }

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

// Supplier sends message
exports.supplierSendMessage = [
  authenticateJWT, supplierIsLoggedIn,
  async (req, res) => {
    try {
      const { dispute_id, message } = req.body;
      let imagePath = null;

      if (req.files?.image) {
        imagePath = await handleFileUpload(req.files.image);
      }

      // Validate dispute and supplier access
      const [dispute] = await new Promise((resolve, reject) => {
        const query = `
          SELECT d.id
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id 
          WHERE d.id = ? AND b.supplier_id = ?
        `;
        db.query(
          query,
          [dispute_id, req.user.id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!dispute) {
        return res
          .status(404)
          .json({ error: "Dispute not found or unauthorized." });
      }

      // Insert message
      const result = await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO supplier_chats (dispute_id, sender_type, sender_id, message, image_url)
          VALUES (?, 'supplier', ?, ?, ?)
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
          resolve(results.map((row) => row.username));
        });
      });

      await Promise.all(
        adminUsernames.map((username) =>
          notificationService.createNotification({
            recipientId: username,
            recipientType: "admin",
            title: "New Message from Supplier",
            message: `A supplier has sent a new message regarding dispute #${dispute_id}.`,
            type: "supplier_chat",
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
      console.error("Error sending supplier message:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

// Get supplier chat messages
exports.getSupplierChatMessages = [
  authenticateJWT, supplierIsLoggedIn,
  async (req, res) => {
    try {
      const { dispute_id } = req.params;

      // Validate dispute and supplier access, get order_id
      const [dispute] = await new Promise((resolve, reject) => {
        const query = `
          SELECT d.id, CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id 
          WHERE d.id = ? AND b.supplier_id = ?
        `;
        db.query(query, [dispute_id, req.user.id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!dispute) {
        return res.status(404).json({ 
          error: "Dispute not found or unauthorized." 
        });
      }

      const messages = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            sc.message, 
            sc.sender_type, 
            sc.created_at AS time_sent,
            sc.image_url,
            CASE sc.sender_type 
              WHEN 'supplier' THEN s.company_name 
              WHEN 'admin' THEN a.username 
            END AS sender_name
          FROM supplier_chats sc
          LEFT JOIN suppliers s ON sc.sender_type = 'supplier' AND sc.sender_id = s.id
          LEFT JOIN admin a ON sc.sender_type = 'admin' AND sc.sender_id = a.id
          WHERE sc.dispute_id = ?
          ORDER BY sc.created_at ASC
        `;
        db.query(query, [dispute_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      res.json({
        message: "Chat messages fetched successfully.",
        data: messages,
        order_id: dispute.order_id
      });
    } catch (error) {
      console.error("Error fetching supplier chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
];

// Get admin view of supplier chat messages
exports.getAdminSupplierChatMessages = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { dispute_id } = req.params;

      // Validate dispute exists
      const [dispute] = await new Promise((resolve, reject) => {
        const query = `
          SELECT d.id, CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id
          WHERE d.id = ?
        `;
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
        message: "Chat messages fetched successfully (Admin View).",
        data: messages,
        order_id: dispute.order_id
      });
    } catch (error) {
      console.error("Error fetching admin-supplier chat messages:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
];

