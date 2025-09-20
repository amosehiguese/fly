const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../../utils/notificationService");
const emailService = require("../../../utils/emailService");
const path = require("path");
const fs = require("fs").promises;
const { format, differenceInCalendarMonths, addMonths } = require("date-fns");
const { check, validationResult } = require("express-validator");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
  supplierIsLoggedIn,
} = require("../../controllers/loginController/authMiddleware");

const UPLOAD_DIR = path.join(
  __dirname,
  "../../uploads/customer-supplier-messages"
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
  return `/uploads/customer-supplier-messages/${uniqueFilename}`;
};

exports.initiateChat = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const user_id = req.user.id; // Customer's ID
    const { supplier_id, reason } = req.body;

    if (!supplier_id || !reason) {
      return res
        .status(400)
        .json({ error: "Supplier ID and reason are required." });
    }

    try {
      // Check if a chat already exists
      const [existingChat] = await db
        .promise()
        .query(
          `SELECT id FROM customer_supplier_chat WHERE customer_id = ? AND supplier_id = ?`,
          [user_id, supplier_id]
        );

      if (existingChat.length > 0) {
        return res.status(200).json({
          message: "Chat already exists",
          chat_id: existingChat[0].id,
        });
      }

      // Insert new chat initiation
      const [newChat] = await db
        .promise()
        .query(
          `INSERT INTO customer_supplier_chat (customer_id, supplier_id, reason) VALUES (?, ?, ?)`,
          [user_id, supplier_id, reason]
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

// CUSTOMER SEND MESSAGE
exports.sendCustomerMessage = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const role = req.user.role; // Customer role
    const user_id = req.user.id; // Customer ID
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (role !== "customer") {
      return res
        .status(403)
        .json({ error: "Only customers can send messages." });
    }

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO customer_supplier_chat_messages (chat_id, sender_type, sender_id, message, image_url)
           VALUES (?, 'customer', ?, ?, ?)`,
        [chat_id, user_id, message || null, image_url]
      );

      res.status(201).json({ message: "Customer message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// SUPPLIER SEND MESSAGE
exports.sendSupplierMessage = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const role = req.user.role; // Supplier role
    const user_id = req.user.id; // Supplier ID
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (role !== "supplier") {
      return res
        .status(403)
        .json({ error: "Only suppliers can send messages." });
    }

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO customer_supplier_chat_messages (chat_id, sender_type, sender_id, message, image_url)
           VALUES (?, 'supplier', ?, ?, ?)`,
        [chat_id, user_id, message || null, image_url]
      );

      res.status(201).json({ message: "Supplier message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.getAllSuppliers = async (req, res) => {
  try {
    // Get page number from query params (default to 1)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10; // Limit per page
    const offset = (page - 1) * limit; // Calculate offset

    // Fetch suppliers with pagination
    const query = `
        SELECT id AS supplier_id, company_name
        FROM suppliers
        ORDER BY company_name ASC
        LIMIT ? OFFSET ?;
      `;

    // Get total suppliers count for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM suppliers;`;

    // Execute queries
    const [[{ total }]] = await db.promise().query(countQuery);
    const [suppliers] = await db.promise().query(query, [limit, offset]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Suppliers fetched successfully",
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_suppliers: total,
        per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      data: suppliers,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// CUSTOMER GET CHAT MESSAGES
exports.getCustomerChatMessages = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const { chat_id } = req.params;
    const role = req.user.role; // Customer role
    const user_id = req.user.id; // Customer ID

    if (role !== "customer") {
      return res
        .status(403)
        .json({ error: "Only customers can access chat messages." });
    }

    try {
      const query = `
        SELECT 
          cscm.sender_type, 
          cscm.sender_id, 
          cscm.message, 
          cscm.image_url, 
          cscm.created_at,
          CASE 
            WHEN cscm.sender_type = 'supplier' THEN s.company_name 
            WHEN cscm.sender_type = 'customer' THEN c.fullname 
            ELSE NULL 
          END AS sender_name
        FROM customer_supplier_chat_messages cscm
        LEFT JOIN suppliers s ON cscm.sender_id = s.id AND cscm.sender_type = 'supplier'
        LEFT JOIN customers c ON cscm.sender_id = c.id AND cscm.sender_type = 'customer'
        WHERE cscm.chat_id = ? 
          AND cscm.chat_id IN (
            SELECT id FROM customer_supplier_chat WHERE customer_id = ?
          )
        ORDER BY cscm.created_at ASC;
      `;

      const [messages] = await db.promise().query(query, [chat_id, user_id]);

      res.status(200).json({
        message: "Customer chat messages fetched successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// SUPPLIER GET CHAT MESSAGES
exports.getSupplierChatMessages = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const { chat_id } = req.params;
    const role = req.user.role; // Supplier role
    const user_id = req.user.id; // Supplier ID

    if (role !== "supplier") {
      return res
        .status(403)
        .json({ error: "Only suppliers can access chat messages." });
    }

    try {
      const query = `
        SELECT 
          cscm.sender_type, 
          cscm.sender_id, 
          cscm.message, 
          cscm.image_url, 
          cscm.created_at,
          CASE 
            WHEN cscm.sender_type = 'supplier' THEN s.company_name 
            WHEN cscm.sender_type = 'customer' THEN c.fullname 
            ELSE NULL 
          END AS sender_name
        FROM customer_supplier_chat_messages cscm
        LEFT JOIN suppliers s ON cscm.sender_id = s.id AND cscm.sender_type = 'supplier'
        LEFT JOIN customers c ON cscm.sender_id = c.id AND cscm.sender_type = 'customer'
        WHERE cscm.chat_id = ? 
          AND cscm.chat_id IN (
            SELECT id FROM customer_supplier_chat WHERE supplier_id = ?
          )
        ORDER BY cscm.created_at ASC;
      `;

      const [messages] = await db.promise().query(query, [chat_id, user_id]);

      res.status(200).json({
        message: "Supplier chat messages fetched successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// CUSTOMER GET CONVERSATIONS
exports.getCustomerConversations = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const role = req.user.role; // Customer role
    const user_id = req.user.id; // Customer ID

    if (role !== "customer") {
      return res
        .status(403)
        .json({ error: "Only customers can view conversations." });
    }

    try {
      const query = `
        SELECT 
          csc.id AS chat_id, 
          csc.created_at AS chat_created_at, 
          s.id AS supplier_id, 
          s.company_name AS supplier_name,
          cscm.message AS last_message,
          cscm.sender_type AS last_sender_type,
          CASE 
            WHEN cscm.sender_type = 'supplier' THEN s.company_name 
            WHEN cscm.sender_type = 'customer' THEN c.fullname 
            ELSE NULL 
          END AS last_sender_name,
          cscm.created_at AS last_message_time
        FROM customer_supplier_chat csc
        JOIN suppliers s ON csc.supplier_id = s.id
        JOIN customers c ON csc.customer_id = c.id
        LEFT JOIN customer_supplier_chat_messages cscm 
          ON cscm.chat_id = csc.id 
          AND cscm.created_at = (
            SELECT MAX(created_at) 
            FROM customer_supplier_chat_messages 
            WHERE chat_id = csc.id
          )
        WHERE csc.customer_id = ?
        ORDER BY last_message_time DESC;
      `;

      const [conversations] = await db.promise().query(query, [user_id]);

      res.status(200).json({
        message: "Customer conversations fetched successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching customer conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// SUPPLIER GET CONVERSATIONS
exports.getSupplierConversations = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const role = req.user.role; // Supplier role
    const user_id = req.user.id; // Supplier ID

    if (role !== "supplier") {
      return res
        .status(403)
        .json({ error: "Only suppliers can view conversations." });
    }

    try {
      const query = `
        SELECT 
          csc.id AS chat_id, 
          c.id AS customer_id, 
          c.fullname AS customer_name, 
          cscm.message AS last_message,
          cscm.sender_type AS last_sender_type,
          CASE 
            WHEN cscm.sender_type = 'supplier' THEN s.company_name 
            WHEN cscm.sender_type = 'customer' THEN c.fullname 
            ELSE NULL 
          END AS last_sender_name,
          cscm.created_at AS last_message_time
        FROM customer_supplier_chat csc
        JOIN customers c ON csc.customer_id = c.id
        JOIN suppliers s ON csc.supplier_id = s.id
        LEFT JOIN customer_supplier_chat_messages cscm 
          ON cscm.chat_id = csc.id 
          AND cscm.created_at = (
            SELECT MAX(created_at) 
            FROM customer_supplier_chat_messages 
            WHERE chat_id = csc.id
          )
        WHERE csc.supplier_id = ?
        ORDER BY last_message_time DESC;
      `;

      const [conversations] = await db.promise().query(query, [user_id]);

      res.status(200).json({
        message: "Supplier conversations fetched successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching supplier conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// CUSTOMER SEND MESSAGE
exports.sendCustomerMessage = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const role = req.user.role; // Customer role
    const user_id = req.user.id; // Customer ID
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (role !== "customer") {
      return res
        .status(403)
        .json({ error: "Only customers can send messages." });
    }

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO customer_supplier_chat_messages (chat_id, sender_type, sender_id, message, image_url)
           VALUES (?, 'customer', ?, ?, ?)`,
        [chat_id, user_id, message || null, image_url]
      );

      res.status(201).json({ message: "Customer message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// SUPPLIER SEND MESSAGE
exports.sendSupplierMessage = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const role = req.user.role; // Supplier ID
    const user_id = req.user.id; // Supplier ID
    const { chat_id, message } = req.body;
    const file = req.files?.image;

    if (role !== "supplier") {
      return res
        .status(403)
        .json({ error: "Only suppliers can send messages." });
    }

    if (!chat_id || (!message && !file)) {
      return res.status(400).json({ error: "Message or image is required." });
    }

    try {
      const image_url = await handleFileUpload(file);

      await db.promise().query(
        `INSERT INTO customer_supplier_chat_messages (chat_id, sender_type, sender_id, message, image_url)
           VALUES (?, 'supplier', ?, ?, ?)`,
        [chat_id, user_id, message || null, image_url]
      );

      res.status(201).json({ message: "Supplier message sent successfully!" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Admin getting messages
exports.getAdminChatMessages = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    const { chat_id } = req.params;

    try {
      const query = `
          SELECT sender_type, sender_id, message, image_url, created_at
          FROM customer_supplier_chat_messages
          WHERE chat_id = ? AND chat_id IN (
            SELECT id FROM customer_supplier_chat
          )
          ORDER BY created_at ASC;
        `;

      const [messages] = await db.promise().query(query, [chat_id]);

      res.status(200).json({
        message: "Supplier and customer chat messages fetched successfully",
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// ADMIN GET CONVERSATIONS
exports.getAdminConversations = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const query = `
          SELECT DISTINCT csc.id AS chat_id, csc.created_at AS chat_created_at, c.id AS customer_id, c.fullname AS customer_name
          FROM customer_supplier_chat csc
          JOIN customers c ON csc.customer_id = c.id
          ORDER BY csc.created_at DESC;
        `;

      const [conversations] = await db.promise().query(query);

      res.status(200).json({
        message: "Supplier and customer conversations fetched successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching supplier conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
