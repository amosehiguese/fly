const { getIO } = require("../../socket");
const db = require("../../db/connect");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateJWT, userIsLoggedIn } = require("../controllers/loginController/authMiddleware");

// Upload configuration
const UPLOAD_DIR = path.join(__dirname, '../../uploads/conversations');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Create upload directory
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
})();

// File upload helper
const handleFileUpload = async (file) => {
  if (!file) return null;
  
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only images, PDF and Word documents are allowed.');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
  
  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);
  
  await file.mv(filePath);
  return `/uploads/conversations/${uniqueFilename}`;
};


const getCustomerConversations = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    const customerEmail = req.user.email;

    try {
      const query = `
        SELECT 
          c.id as conversation_id,
          c.bid_id,
          c.created_at,
          c.updated_at,
          b.quotation_type,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          (
            SELECT COUNT(*) 
            FROM messages m 
            WHERE m.conversation_id = c.id 
            AND m.is_read = false 
            AND m.sender_type = 'admin'
          ) as unread_count,
          (
            SELECT content
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_message,
          (
            SELECT attachment_path
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_attachment
        FROM conversations c
        JOIN bids b ON c.bid_id = b.id
        WHERE b.id IN (
          SELECT b2.id FROM bids b2
          LEFT JOIN company_relocation cr ON b2.quotation_id = cr.id AND b2.quotation_type = 'company_relocation'
          LEFT JOIN move_out_cleaning mc ON b2.quotation_id = mc.id AND b2.quotation_type = 'move_out_cleaning'
          LEFT JOIN storage st ON b2.quotation_id = st.id AND b2.quotation_type = 'storage'
          LEFT JOIN heavy_lifting hl ON b2.quotation_id = hl.id AND b2.quotation_type = 'heavy_lifting'
          LEFT JOIN carrying_assistance ca ON b2.quotation_id = ca.id AND b2.quotation_type = 'carrying_assistance'
          LEFT JOIN junk_removal jr ON b2.quotation_id = jr.id AND b2.quotation_type = 'junk_removal'
          LEFT JOIN estate_clearance ec ON b2.quotation_id = ec.id AND b2.quotation_type = 'estate_clearance'
          LEFT JOIN evacuation_move em ON b2.quotation_id = em.id AND b2.quotation_type = 'evacuation_move'
          LEFT JOIN private_move pm ON b2.quotation_id = pm.id AND b2.quotation_type = 'private_move'
          LEFT JOIN moving_service ms ON b2.quotation_id = ms.id AND b2.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad')
          WHERE cr.email_address = ? 
          OR mc.email_address = ?
          OR st.email_address = ?
          OR hl.email_address = ?
          OR ca.email_address = ?
          OR jr.email_address = ?
          OR ec.email_address = ?
          OR em.email_address = ?
          OR pm.email_address = ?
          OR (ms.email_address = ? AND JSON_CONTAINS(ms.type_of_service, ?, '$'))
        )
        ORDER BY c.updated_at DESC
      `;

      const conversations = await new Promise((resolve, reject) => {
        db.query(
          query,
          [
            ...Array(9).fill(customerEmail),
            customerEmail,
            JSON.stringify([
              "local_move",
              "long_distance_move",
              "moving_abroad",
            ]),
          ],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      res.json(conversations);
    } catch (error) {
      console.error("Error fetching customer conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

const getConversationMessages = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    const { conversation_id } = req.params;
    const customerEmail = req.user.email;

    try {
      const [conversation] = await new Promise((resolve, reject) => {
        db.query(
          `
          SELECT 
            c.*,
            b.quotation_type,
            b.quotation_id,
            CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id 
          FROM conversations c
          JOIN bids b ON c.bid_id = b.id
          LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
          LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'move_out_cleaning'
          LEFT JOIN storage st ON b.quotation_id = st.id AND b.quotation_type = 'storage'
          LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
          LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id AND b.quotation_type = 'carrying_assistance'
          LEFT JOIN junk_removal jr ON b.quotation_id = jr.id AND b.quotation_type = 'junk_removal'
          LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
          LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
          LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
          LEFT JOIN moving_service ms ON b.quotation_id = ms.id AND b.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad')
          WHERE c.id = ? AND (
            cr.email_address = ? OR
            mc.email_address = ? OR
            st.email_address = ? OR
            hl.email_address = ? OR
            ca.email_address = ? OR
            jr.email_address = ? OR
            ec.email_address = ? OR
            em.email_address = ? OR
            pm.email_address = ? OR
            (ms.email_address = ? AND JSON_CONTAINS(ms.type_of_service, ?, '$'))
          )
        `,
          [
            conversation_id,
            ...Array(9).fill(customerEmail),
            customerEmail,
            JSON.stringify([
              "local_move",
              "long_distance_move",
              "moving_abroad",
            ]),
          ],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!conversation) {
        return res
          .status(403)
          .json({ error: "Access denied to this conversation" });
      }

      const messages = await new Promise((resolve, reject) => {
        db.query(
          `
          SELECT 
            id,
            content,
            attachment_path,
            sender_type,
            sender_id,
            created_at,
            is_read
          FROM messages 
          WHERE conversation_id = ?
          ORDER BY created_at ASC
        `,
          [conversation_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          `
          UPDATE messages 
          SET is_read = true 
          WHERE conversation_id = ? 
          AND sender_type = 'admin' 
          AND is_read = false
        `,
          [conversation_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      res.json({
        messages,
        order_id: conversation.order_id,
      });
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

const replyToConversation = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    const { conversation_id } = req.params;
    const { content } = req.body;
    const customer_id = req.user?.id;
    const customerEmail = req.user?.email;

    if (!customer_id || !customerEmail) {
      return res
        .status(401)
        .json({ error: "Customer details not found in session." });
    }

    if (!content?.trim() && !req.files) {
      return res
        .status(400)
        .json({ error: "Message must contain content or attachment." });
    }

    try {
      let attachmentPath = null;
      if (req.files?.attachment) {
        try {
          attachmentPath = await handleFileUpload(req.files.attachment);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }

      const [conversationDetails] = await new Promise((resolve, reject) => {
        const checkQuery = `
          SELECT 
            c.id AS conversation_id,
            b.id AS bid_id,
            b.quotation_id,
            b.quotation_type,
            CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id
          FROM conversations c
          JOIN bids b ON c.bid_id = b.id
          WHERE c.id = ?
        `;
        db.query(checkQuery, [conversation_id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      if (!conversationDetails) {
        return res.status(404).json({ error: "Conversation not found." });
      }

      let ownershipQuery;
      let queryParams;

      if (
        ["local_move", "long_distance_move", "moving_abroad"].includes(
          conversationDetails.quotation_type
        )
      ) {
        ownershipQuery = `
          SELECT 1 
          FROM moving_service q
          WHERE q.id = ? 
          AND q.email_address = ?
          AND JSON_CONTAINS(q.type_of_service, ?, '$')
        `;
        queryParams = [
          conversationDetails.quotation_id,
          customerEmail,
          `"${conversationDetails.quotation_type}"`,
        ];
      } else {
        ownershipQuery = `
          SELECT 1 
          FROM ${conversationDetails.quotation_type} q
          WHERE q.id = ? AND q.email_address = ?
        `;
        queryParams = [conversationDetails.quotation_id, customerEmail];
      }

      const [ownership] = await new Promise((resolve, reject) => {
        db.query(ownershipQuery, queryParams, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      if (!ownership) {
        if (attachmentPath) {
          await fs.unlink(path.join(__dirname, "../../", attachmentPath));
        }
        return res
          .status(403)
          .json({ error: "Access denied to this conversation." });
      }

      const result = await new Promise((resolve, reject) => {
        db.query(
          `
          INSERT INTO messages (
            conversation_id,
            content,
            attachment_path,
            sender_type,
            sender_id,
            created_at,
            is_read
          ) VALUES (?, ?, ?, 'customer', ?, NOW(), false)
          `,
          [conversation_id, content, attachmentPath, customer_id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE conversations SET updated_at = NOW() WHERE id = ?",
          [conversation_id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      const io = getIO();
      const message = {
        conversation_id,
        content,
        attachment_path: attachmentPath,
        sender_type: "customer",
        sender_id: customer_id,
        created_at: new Date(),
        is_read: false,
        order_id: conversationDetails.order_id,
      };

      io.to("admin_support").emit("new_message", {
        conversation_id,
        message,
        order_id: conversationDetails.order_id,
      });

      io.to(`customer_${customer_id}`).emit("message_sent", {
        ...message,
        order_id: conversationDetails.order_id,
      });

      res.status(201).json({
        message: "Reply sent successfully",
        message_id: result.insertId,
        order_id: conversationDetails.order_id,
        attachment_path: attachmentPath,
      });
    } catch (error) {
      if (req.files?.attachment) {
        const file = req.files.attachment;
        try {
          await fs.unlink(file.tempFilePath);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary file:", cleanupError);
        }
      }

      console.error("Error sending customer reply:", error);
      if (error.code === "ER_NO_SUCH_TABLE") {
        return res.status(400).json({ error: "Invalid quotation type." });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

const initiateConversation = [
  authenticateJWT, userIsLoggedIn,
  async (req, res) => {
    const { order_id } = req.body;
    const customerEmail = req.user.email;

    if (!order_id || typeof order_id !== "string") {
      return res.status(400).json({
        error: "Order ID is required and must be a string",
        received: typeof order_id,
      });
    }

    try {
      const parts = order_id.split("-");

      if (parts.length !== 3) {
        return res.status(400).json({
          error:
            "Invalid order ID format. Expected format: quotation_type-quotation_id-bid_id",
          received: order_id,
        });
      }

      const [quotation_type, quotation_id, bid_id] = parts;

      if (!quotation_type || !quotation_id || !bid_id) {
        return res.status(400).json({
          error: "Invalid order ID format - all parts must be non-empty",
          received: { quotation_type, quotation_id, bid_id },
        });
      }

      // Rest of your code remains the same...
      const query = `
        SELECT b.*, 
               CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
               CASE b.quotation_type
                   WHEN 'company_relocation' THEN cr.email_address
                   WHEN 'move_out_cleaning' THEN mc.email_address
                   WHEN 'storage' THEN st.email_address
                   WHEN 'heavy_lifting' THEN hl.email_address
                   WHEN 'carrying_assistance' THEN ca.email_address
                   WHEN 'junk_removal' THEN jr.email_address
                   WHEN 'estate_clearance' THEN ec.email_address
                   WHEN 'evacuation_move' THEN em.email_address
                   WHEN 'private_move' THEN pm.email_address
                   WHEN 'local_move' THEN ms_local.email_address
                   WHEN 'long_distance_move' THEN ms_long.email_address
                   WHEN 'moving_abroad' THEN ms_abroad.email_address
               END AS customer_email,
               b.status
        FROM bids b
        LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
        LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'move_out_cleaning'
        LEFT JOIN storage st ON b.quotation_id = st.id AND b.quotation_type = 'storage'
        LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
        LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id AND b.quotation_type = 'carrying_assistance'
        LEFT JOIN junk_removal jr ON b.quotation_id = jr.id AND b.quotation_type = 'junk_removal'
        LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
        LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
        LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
        LEFT JOIN moving_service ms_local ON b.quotation_id = ms_local.id 
          AND b.quotation_type = 'local_move' 
          AND JSON_CONTAINS(ms_local.type_of_service, '"local_move"', '$')
        LEFT JOIN moving_service ms_long ON b.quotation_id = ms_long.id 
          AND b.quotation_type = 'long_distance_move' 
          AND JSON_CONTAINS(ms_long.type_of_service, '"long_distance_move"', '$')
        LEFT JOIN moving_service ms_abroad ON b.quotation_id = ms_abroad.id 
          AND b.quotation_type = 'moving_abroad' 
          AND JSON_CONTAINS(ms_abroad.type_of_service, '"moving_abroad"', '$')
        WHERE b.id = ? 
        AND b.quotation_type = ? 
        AND b.quotation_id = ?
      `;

      const [bid] = await new Promise((resolve, reject) => {
        db.query(
          query,
          [bid_id, quotation_type, quotation_id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (
        !bid ||
        !bid.customer_email ||
        bid.customer_email !== customerEmail ||
        bid.status !== "accepted"
      ) {
        return res.status(403).json({
          error:
            "Cannot create conversation. Either the order doesn't exist, isn't accepted, or you don't have access to it.",
        });
      }

      // Check if conversation exists
      const [existingConversation] = await new Promise((resolve, reject) => {
        db.query(
          "SELECT id FROM conversations WHERE bid_id = ?",
          [bid_id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (existingConversation) {
        return res.status(400).json({
          error: "Conversation already exists",
          conversation_id: existingConversation.id,
          order_id: bid.order_id,
        });
      }

      // Create conversation
      const result = await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO conversations (bid_id, created_at, updated_at) VALUES (?, NOW(), NOW())",
          [bid_id],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      // Notify admin support
      const io = getIO();
      io.to("admin_support").emit("new_conversation", {
        conversation_id: result.insertId,
        order_id: bid.order_id,
        quotation_type: bid.quotation_type,
        created_at: new Date(),
      });

      res.status(201).json({
        message: "Conversation created successfully.",
        conversation_id: result.insertId,
        order_id: bid.order_id,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

module.exports = {
  getCustomerConversations,
  getConversationMessages,
  replyToConversation,
  initiateConversation,
};
