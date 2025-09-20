const { getIO } = require('../../socket');
const db = require('../../db/connect');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { authenticateJWT, userIsLoggedIn, logAdminActivity, checkRole } = require("../controllers/loginController/authMiddleware");


// Upload configuration
const UPLOAD_DIR = path.join(__dirname, '../../uploads/admin-conversations');
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
  return `/uploads/admin-conversations/${uniqueFilename}`;
};


  

const getAdminConversations = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    try {
      const [conversations] = await db.promise().query(`
        SELECT 
          c.id as conversation_id,
          c.bid_id,
          c.created_at,
          c.updated_at,
          b.quotation_type,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          COALESCE(
            cr.email_address,
            mc.email_address,
            st.email_address,
            hl.email_address,
            ca.email_address,
            jr.email_address,
            ec.email_address,
            em.email_address,
            pm.email_address,
            ms_local.email_address,
            ms_long.email_address,
            ms_abroad.email_address
          ) as customer_email,
          (
            SELECT COUNT(*) 
            FROM messages m 
            WHERE m.conversation_id = c.id 
            AND m.is_read = false 
            AND m.sender_type = 'customer'
          ) as unread_count,
          (
            SELECT content
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_message
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
        LEFT JOIN moving_service ms_local ON b.quotation_id = ms_local.id 
          AND b.quotation_type = 'local_move' 
          AND JSON_CONTAINS(ms_local.type_of_service, '"local_move"', '$')
        LEFT JOIN moving_service ms_long ON b.quotation_id = ms_long.id 
          AND b.quotation_type = 'long_distance_move' 
          AND JSON_CONTAINS(ms_long.type_of_service, '"long_distance_move"', '$')
        LEFT JOIN moving_service ms_abroad ON b.quotation_id = ms_abroad.id 
          AND b.quotation_type = 'moving_abroad' 
          AND JSON_CONTAINS(ms_abroad.type_of_service, '"moving_abroad"', '$')
        ORDER BY c.updated_at DESC
      `);

      await logAdminActivity(
        req,
        req.admin.id,
        'VIEW_ALL_CONVERSATIONS',
        'Viewed all admin conversations',
        null,
        'conversations'
      );

      res.json(conversations);
    } catch (error) {
      console.error('Error fetching admin conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const adminReplyToConversation = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    const { conversation_id, content } = req.body;
    const adminId = req.admin.id;

    if (!content?.trim() && !req.files) {
      return res.status(400).json({ error: "Message must contain content or attachment" });
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

      // Get conversation details
      const [conversationResults] = await db.promise().query(
        'SELECT c.*, b.quotation_type, CONCAT(b.quotation_type, "-", b.quotation_id, "-", b.id) AS order_id FROM conversations c JOIN bids b ON c.bid_id = b.id WHERE c.id = ?',
        [conversation_id]
      );
      const conversation = conversationResults[0];

      if (!conversation) {
        if (attachmentPath) {
          await fs.unlink(path.join(__dirname, "../../", attachmentPath));
        }
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Insert admin's reply
      const [result] = await db.promise().query(
        `INSERT INTO messages (
          conversation_id,
          content,
          attachment_path,
          sender_type,
          sender_id,
          created_at,
          is_read
        ) VALUES (?, ?, ?, 'admin', ?, NOW(), false)`,
        [conversation_id, content, attachmentPath, adminId]
      );

      // Update conversation timestamp
      await db.promise().query(
        'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
        [conversation_id]
      );

      await logAdminActivity(
        req,
        adminId,
        'REPLY_TO_CONVERSATION',
        `Replied to conversation #${conversation_id} for order ${conversation.order_id}`,
        conversation_id,
        'message'
      );

      // Emit socket event
      const io = getIO();
      const message = {
        id: result.insertId,
        content,
        attachment_path: attachmentPath,
        sender_type: 'admin',
        sender_id: adminId,
        created_at: new Date(),
        is_read: false,
        order_id: conversation.order_id
      };

      io.to(`conversation_${conversation_id}`).emit('new_message', {
        conversation_id,
        message,
        order_id: conversation.order_id
      });

      res.status(201).json({
        message: "Reply sent successfully",
        message_id: result.insertId,
        attachment_path: attachmentPath,
        order_id: conversation.order_id
      });
    } catch (error) {
      console.error('Error sending admin reply:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getAdminConversationById = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      const [quotation_type, quotation_id, bid_id] = order_id.split('-');
      
      if (!quotation_type || !quotation_id || !bid_id) {
        return res.status(400).json({ 
          error: "Invalid order ID format. Expected format: quotation_type-quotation_id-bid_id" 
        });
      }

      const [conversationMessages] = await db.promise().query(
        `SELECT 
          c.id as conversation_id,
          c.bid_id,
          c.created_at,
          c.updated_at,
          b.quotation_type,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          COALESCE(
            cr.email_address,
            mc.email_address,
            st.email_address,
            hl.email_address,
            ca.email_address,
            jr.email_address,
            ec.email_address,
            em.email_address,
            pm.email_address,
            ms_local.email_address,
            ms_long.email_address,
            ms_abroad.email_address
          ) as customer_email,
          m.id as message_id,
          m.content,
          m.attachment_path,
          m.sender_type,
          m.sender_id,
          m.created_at as message_created_at,
          m.is_read
        FROM conversations c
        JOIN bids b ON c.bid_id = b.id
        LEFT JOIN messages m ON c.id = m.conversation_id
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
        ORDER BY m.created_at ASC`,
        [bid_id, quotation_type, quotation_id]
      );

      if (!conversationMessages.length) {
        return res.status(404).json({ error: "No conversations found for this order" });
      }

      // Group messages by conversation
      const conversations = conversationMessages.reduce((acc, row) => {
        if (!acc[row.conversation_id]) {
          acc[row.conversation_id] = {
            conversation_id: row.conversation_id,
            bid_id: row.bid_id,
            order_id: row.order_id,
            customer_email: row.customer_email,
            created_at: row.created_at,
            updated_at: row.updated_at,
            messages: []
          };
        }
        if (row.message_id) {
          acc[row.conversation_id].messages.push({
            id: row.message_id,
            content: row.content,
            attachment_path: row.attachment_path,
            sender_type: row.sender_type,
            sender_id: row.sender_id,
            created_at: row.message_created_at,
            is_read: row.is_read
          });
        }
        return acc;
      }, {});

      await logAdminActivity(
        req,
        req.admin.id,
        'VIEW_CONVERSATION',
        `Viewed conversation for order ${order_id}`,
        Object.keys(conversations)[0],
        'conversation'
      );

      res.json(Object.values(conversations));
    } catch (error) {
      console.error('Error fetching conversations by order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];


module.exports = {
  getAdminConversations,
  adminReplyToConversation,
  getAdminConversationById
};