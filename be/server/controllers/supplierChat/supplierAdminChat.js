const db = require("../../../db/connect");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const {
  authenticateJWT,
  supplierIsLoggedIn,
  checkRole,
} = require("../loginController/authMiddleware");

const UPLOAD_DIR = path.join(
  __dirname,
  "../../uploads/supplier-admin-messages"
);
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create upload directory if not exists
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
  return `/uploads/supplier-admin-messages/${uniqueFilename}`;
};

// Initiate chat with admin
exports.initiateSupplierChat = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { reason, priority = "normal" } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Reason is required." });
    }

    try {
      const [newChat] = await db.promise().query(
        `INSERT INTO supplier_admin_chat (supplier_id, reason, priority, status) 
         VALUES (?, ?, ?, 'open')`,
        [supplier_id, reason, priority]
      );

      res.status(201).json({
        message: "Chat initiated successfully!",
        chat_id: newChat.insertId,
      });
    } catch (error) {
      console.error("Error initiating chat:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Supplier send message
exports.sendSupplierMessage = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      // Verify chat belongs to supplier
      const [chatOwnership] = await db
        .promise()
        .query(
          `SELECT id FROM supplier_admin_chat WHERE id = ? AND supplier_id = ?`,
          [chat_id, supplier_id]
        );

      if (chatOwnership.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized access to this chat." });
      }

      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO supplier_admin_chat_messages 
         (chat_id, sender_type, sender_id, message, image_url, read_status)
         VALUES (?, 'supplier', ?, ?, ?, 'unread')`,
        [chat_id, supplier_id, message || null, image_url]
      );

      // Update chat status to unread for admin
      await db
        .promise()
        .query(
          `UPDATE supplier_admin_chat SET admin_last_read = false WHERE id = ?`,
          [chat_id]
        );

      res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Admin send message
exports.sendAdminResponseToSupplier = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    const admin_id = req.admin.id;
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO supplier_admin_chat_messages 
         (chat_id, sender_type, sender_id, message, image_url, read_status)
         VALUES (?, 'admin', ?, ?, ?, 'unread')`,
        [chat_id, admin_id, message || null, image_url]
      );

      // Update chat status to unread for supplier
      await db
        .promise()
        .query(
          `UPDATE supplier_admin_chat SET supplier_last_read = false WHERE id = ?`,
          [chat_id]
        );

      res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Get chat messages for supplier
exports.getSupplierChatMessages = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { chat_id } = req.params;

    try {
      // Mark messages as read
      await db.promise().query(
        `UPDATE supplier_admin_chat_messages 
         SET read_status = 'read' 
         WHERE chat_id = ? AND sender_type = 'admin'`,
        [chat_id]
      );

      // Update supplier's last read status
      await db.promise().query(
        `UPDATE supplier_admin_chat 
         SET supplier_last_read = true 
         WHERE id = ? AND supplier_id = ?`,
        [chat_id, supplier_id]
      );

      const query = `
        SELECT 
          m.sender_type,
          m.sender_id,
          m.message,
          m.image_url,
          m.created_at,
          m.read_status,
          CASE 
            WHEN m.sender_type = 'admin' THEN a.username
            WHEN m.sender_type = 'supplier' THEN s.company_name
          END as sender_name
        FROM supplier_admin_chat_messages m
        LEFT JOIN admin a ON m.sender_type = 'admin' AND m.sender_id = a.id
        LEFT JOIN suppliers s ON m.sender_type = 'supplier' AND m.sender_id = s.id
        WHERE m.chat_id = ? AND chat_id IN (
          SELECT id FROM supplier_admin_chat WHERE supplier_id = ?
        )
        ORDER BY m.created_at ASC
      `;

      const [messages] = await db
        .promise()
        .query(query, [chat_id, supplier_id]);

      res.status(200).json({
        message: "Chat messages fetched successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Get all supplier conversations
exports.getSupplierConversations = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;

    try {
      const query = `
        SELECT 
          sc.id as chat_id,
          sc.reason,
          sc.priority,
          sc.status,
          sc.created_at,
          sc.supplier_last_read,
          (SELECT COUNT(*) FROM supplier_admin_chat_messages 
           WHERE chat_id = sc.id AND read_status = 'unread' 
           AND sender_type = 'admin') as unread_count
        FROM supplier_admin_chat sc
        WHERE sc.supplier_id = ?
        ORDER BY sc.created_at DESC
      `;

      const [conversations] = await db.promise().query(query, [supplier_id]);

      res.status(200).json({
        message: "Conversations fetched successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Get all supplier conversations for admin
exports.getAdminSupplierConversations = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const query = `
        SELECT 
          sc.id as chat_id,
          sc.reason,
          sc.priority,
          sc.status,
          sc.created_at,
          sc.admin_last_read,
          s.id as supplier_id,
          s.company_name as supplier_name,
          s.email as supplier_email,
          (SELECT COUNT(*) FROM supplier_admin_chat_messages 
           WHERE chat_id = sc.id AND read_status = 'unread' 
           AND sender_type = 'supplier') as unread_count
        FROM supplier_admin_chat sc
        JOIN suppliers s ON sc.supplier_id = s.id
        ORDER BY sc.priority DESC, sc.created_at DESC
      `;

      const [conversations] = await db.promise().query(query);

      res.status(200).json({
        message: "Conversations fetched successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.getAdminSupplierChatMessages = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    const { chat_id } = req.params;
    const admin_id = req.admin.id;

    try {
      // Mark messages as read for admin
      await db.promise().query(
        `UPDATE supplier_admin_chat_messages 
         SET read_status = 'read' 
         WHERE chat_id = ? AND sender_type = 'supplier'`,
        [chat_id]
      );

      // Update admin's last read status
      await db.promise().query(
        `UPDATE supplier_admin_chat 
         SET admin_last_read = true 
         WHERE id = ?`,
        [chat_id]
      );

      // Fetch messages with sender details
      const query = `
        SELECT 
          m.id,
          m.sender_type,
          m.sender_id,
          m.message,
          m.image_url,
          m.created_at,
          m.read_status,
          CASE 
            WHEN m.sender_type = 'admin' THEN a.username
            WHEN m.sender_type = 'supplier' THEN s.company_name
          END as sender_name,
          CASE 
            WHEN m.sender_type = 'supplier' THEN s.email
            ELSE NULL
          END as sender_email
        FROM supplier_admin_chat_messages m
        LEFT JOIN admin a ON m.sender_type = 'admin' AND m.sender_id = a.id
        LEFT JOIN suppliers s ON m.sender_type = 'supplier' AND m.sender_id = s.id
        WHERE m.chat_id = ?
        ORDER BY m.created_at ASC
      `;

      const [messages] = await db.promise().query(query, [chat_id]);

      // Get chat details
      const chatQuery = `
        SELECT 
          sc.*,
          s.company_name,
          s.email as supplier_email,
          s.phone as supplier_phone
        FROM supplier_admin_chat sc
        JOIN suppliers s ON sc.supplier_id = s.id
        WHERE sc.id = ?
      `;

      const [chatDetails] = await db.promise().query(chatQuery, [chat_id]);

      if (chatDetails.length === 0) {
        return res.status(404).json({ error: "Chat not found" });
      }

      res.status(200).json({
        message: "Chat messages fetched successfully",
        data: {
          chat: chatDetails[0],
          messages: messages,
        },
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Close chat
exports.closeSupplierChat = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const { chat_id } = req.params;
    const user_type = req.user.role;
    const user_id = req.user.id;

    try {
      // Verify ownership if supplier
      if (user_type === "supplier") {
        const [chatOwnership] = await db
          .promise()
          .query(
            `SELECT id FROM supplier_admin_chat WHERE id = ? AND supplier_id = ?`,
            [chat_id, user_id]
          );

        if (chatOwnership.length === 0) {
          return res
            .status(403)
            .json({ error: "Unauthorized access to this chat." });
        }
      }

      await db
        .promise()
        .query(
          `UPDATE supplier_admin_chat SET status = 'closed' WHERE id = ?`,
          [chat_id]
        );

      res.status(200).json({ message: "Chat closed successfully" });
    } catch (error) {
      console.error("Error closing chat:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
