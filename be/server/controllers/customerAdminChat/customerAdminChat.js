const db = require("../../../db/connect");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require('uuid');
const {
  authenticateJWT,
  userIsLoggedIn,
  checkRole,
} = require("../loginController/authMiddleware");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/customer-admin-messages");
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
    throw new Error("Invalid file type. Only images (JPEG, PNG, GIF) are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);

  await file.mv(filePath);
  return `/uploads/customer-admin-messages/${uniqueFilename}`;
};

// Initiate chat with admin
exports.initiateChat = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const user_id = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Reason is required." });
    }

    try {
      const [newChat] = await db.promise().query(
        `INSERT INTO customer_admin_chat (customer_id, reason) VALUES (?, ?)`,
        [user_id, reason]
      );

      res.status(201).json({
        message: "Chat initiated successfully!",
        chat_id: newChat.insertId,
      });
    } catch (error) {
      console.error("Error initiating chat:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
];

// Customer send message
exports.sendCustomerMessage = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const user_id = req.user.id;
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO customer_admin_chat_messages (chat_id, sender_type, sender_id, message, image_url)
         VALUES (?, 'customer', ?, ?, ?)`,
        [chat_id, user_id, message || null, image_url]
      );

      res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
];

// Admin send message
exports.sendAdminMessage = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO customer_admin_chat_messages (chat_id, sender_type, message, image_url)
         VALUES (?, 'admin', ?, ?)`,
        [chat_id, message || null, image_url]
      );

      res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
];

// Get chat messages for customer
exports.getCustomerChatMessages = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const { chat_id } = req.params;
    const user_id = req.user.id;

    try {
      const query = `
        SELECT sender_type, sender_id, message, image_url, created_at
        FROM customer_admin_chat_messages
        WHERE chat_id = ? AND chat_id IN (
          SELECT id FROM customer_admin_chat WHERE customer_id = ?
        )
        ORDER BY created_at ASC;
      `;

      const [messages] = await db.promise().query(query, [chat_id, user_id]);

      res.status(200).json({
        message: "Chat messages fetched successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
];

// Get chat messages for admin
exports.getAdminChatMessages = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { chat_id } = req.params;

    try {
      const query = `
        SELECT sender_type, sender_id, message, image_url, created_at
        FROM customer_admin_chat_messages
        WHERE chat_id = ?
        ORDER BY created_at ASC;
      `;

      const [messages] = await db.promise().query(query, [chat_id]);

      res.status(200).json({
        message: "Chat messages fetched successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
];

// Get all customer conversations
exports.getCustomerConversations = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const user_id = req.user.id;

    try {
      const query = `
        SELECT id as chat_id, reason, created_at
        FROM customer_admin_chat
        WHERE customer_id = ?
        ORDER BY created_at DESC;
      `;

      const [conversations] = await db.promise().query(query, [user_id]);

      res.status(200).json({
        message: "Conversations fetched successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
];

// Get all conversations for admin
exports.getAdminConversations = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      const query = `
        SELECT cac.id as chat_id, 
               cac.reason,
               cac.created_at,
               c.id as customer_id,
               c.fullname as customer_name
        FROM customer_admin_chat cac
        JOIN customers c ON cac.customer_id = c.id
        ORDER BY cac.created_at DESC;
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
  }
];