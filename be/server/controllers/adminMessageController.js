const db = require('../../db/connect');
const { getIO } = require('../../socket');

const { authenticateJWT, userIsLoggedIn, logAdminActivity, checkRole } = require("../controllers/loginController/authMiddleware");


// Only support_admin and super_admin can access conversations
const getAdminConversations = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    const admin = req.admin;
    try {
      let additionalWhere = '';
      const params = [];

      // Support admins only see conversations with issues or low ratings
      if (admin.role === 'support_admin') {
        additionalWhere = `
          AND (
            EXISTS (
              SELECT 1 FROM reviews r 
              WHERE r.bid_id = b.id 
              AND (r.issues_reported = 1 OR r.satisfaction_rating <= 3)
            )
            OR EXISTS (
              SELECT 1 FROM customer_complaints cc 
              WHERE cc.bid_id = b.id
            )
          )
        `;
      }

      const [conversations] = await db.promise().query(
        `SELECT DISTINCT
          c.id as conversation_id,
          c.bid_id,
          c.created_at,
          b.quotation_type,
          b.quotation_id,
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
          END as customer_email,
          CASE b.quotation_type
            WHEN 'company_relocation' THEN CONCAT(cr.from_city, ' to ', cr.to_city)
            WHEN 'move_out_cleaning' THEN CONCAT(mc.from_city, ' to ', mc.to_city)
            WHEN 'storage' THEN CONCAT(st.from_city, ' to ', st.to_city)
            WHEN 'heavy_lifting' THEN CONCAT(hl.from_city, ' to ', hl.to_city)
            WHEN 'carrying_assistance' THEN CONCAT(ca.from_city, ' to ', ca.to_city)
            WHEN 'junk_removal' THEN CONCAT(jr.from_city, ' to ', jr.to_city)
            WHEN 'estate_clearance' THEN CONCAT(ec.from_city, ' to ', ec.to_city)
            WHEN 'evacuation_move' THEN CONCAT(em.from_city, ' to ', em.to_city)
            WHEN 'private_move' THEN CONCAT(pm.from_city, ' to ', pm.to_city)
          END as location,
          (
            SELECT COUNT(*) 
            FROM messages m2 
            WHERE m2.conversation_id = c.id 
            AND m2.is_read = 0 
            AND m2.sender_type = 'customer'
          ) as unread_count,
          (
            SELECT m3.content
            FROM messages m3
            WHERE m3.conversation_id = c.id
            ORDER BY m3.created_at DESC
            LIMIT 1
          ) as last_message,
          (
            SELECT GROUP_CONCAT(DISTINCT issue_type)
            FROM customer_complaints
            WHERE bid_id = b.id
          ) as complaint_types
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
        WHERE 1=1 ${additionalWhere}
        ORDER BY c.updated_at DESC`,
        params
      );

      await logAdminActivity(
        req,
        req.admin.id,
        'VIEW_CONVERSATIONS',
        `Viewed admin conversations${admin.role === 'support_admin' ? ' (filtered for support admin)' : ''}`,
        null,
        'conversations'
      );

      res.status(200).json({
        conversations,
        admin_role: admin.role,
        total_unread: conversations.reduce((sum, conv) => sum + conv.unread_count, 0)
      });

    } catch (error) {
      console.error('Error fetching admin conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const initiateConversation = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    const { bid_id, initial_message } = req.body;
    const admin = req.admin;

    if (!bid_id || !initial_message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['bid_id', 'initial_message']
      });
    }

    try {
      // Check if bid exists and get details
      const [bidResults] = await db.promise().query(
        `SELECT 
          b.id,
          b.quotation_type,
          CONCAT(
            CASE ? 
              WHEN 'super_admin' THEN 'Admin Support'
              WHEN 'support_admin' THEN 'Customer Support'
            END,
            ' (', a.username, ')'
          ) as admin_name,
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
          END as customer_email
        FROM bids b
        CROSS JOIN admin a
        LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
        LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'move_out_cleaning'
        LEFT JOIN storage st ON b.quotation_id = st.id AND b.quotation_type = 'storage'
        LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
        LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id AND b.quotation_type = 'carrying_assistance'
        LEFT JOIN junk_removal jr ON b.quotation_id = jr.id AND b.quotation_type = 'junk_removal'
        LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
        LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
        LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
        WHERE b.id = ? AND a.id = ?`,
        [admin.role, bid_id, admin.id]
      );

      const bidDetails = bidResults[0];

      if (!bidDetails) {
        return res.status(404).json({ 
          error: 'Bid not found',
          message: 'Could not find a bid with the specified ID.'
        });
      }

      // Check if conversation already exists
      const [convResults] = await db.promise().query(
        'SELECT id FROM conversations WHERE bid_id = ?',
        [bid_id]
      );

      if (convResults.length > 0) {
        return res.status(400).json({
          error: 'Conversation already exists',
          conversation_id: convResults[0].id
        });
      }

      // Create new conversation
      const [createConvResult] = await db.promise().query(
        'INSERT INTO conversations (bid_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
        [bid_id]
      );

      const conversationId = createConvResult.insertId;

      // Add initial message with role-specific sender type
      const [messageResult] = await db.promise().query(
        `INSERT INTO messages (
          conversation_id,
          content,
          sender_id,
          sender_type,
          sender_role,
          created_at,
          is_read
        ) VALUES (?, ?, ?, 'admin', ?, NOW(), false)`,
        [conversationId, initial_message, admin.id, admin.role]
      );

      // Notify customer via Socket.IO with role-specific information
      const io = getIO();
      io.to(`user_${bidDetails.customer_email}`).emit('new_conversation', {
        conversation_id: conversationId,
        bid_id,
        admin_name: bidDetails.admin_name,
        admin_role: admin.role,
        initial_message,
        created_at: new Date()
      });

      await logAdminActivity(
        req,
        req.admin.id,
        'INITIATE_CONVERSATION',
        `Initiated conversation for bid #${bid_id}`,
        conversationId,
        'conversation'
      );

      res.status(201).json({
        message: 'Conversation initiated successfully',
        conversation_id: conversationId,
        message_id: messageResult.insertId,
        admin_role: admin.role
      });

    } catch (error) {
      console.error('Error initiating conversation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

module.exports = {
  getAdminConversations,
  initiateConversation
}; 