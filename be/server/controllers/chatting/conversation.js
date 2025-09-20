const db = require("../../../db/connect");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const {
  authenticateJWT,
  userIsLoggedIn,
  supplierIsLoggedIn,
  checkRole,
} = require("../loginController/authMiddleware");

// File upload configuration
const UPLOAD_DIR = path.join(__dirname, "../../uploads/unified-chat");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Initialize upload directory
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
})();

// Utility function to handle file uploads
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
  return `/uploads/unified-chats/${uniqueFilename}`;
};

// Helper function to get user type and details
const getUserTypeAndId = (req) => {
  if (req.admin) {
    return { userType: "admin", userId: req.admin.id };
  } else if (req.user.role === "supplier") {
    return { userType: "supplier", userId: req.user.id };
  } else if (req.user.role === "driver") {
    return { userType: "driver", userId: req.user.id };
  }
  return { userType: "customer", userId: req.user.id };
};

// Initiate chat
exports.initiateChat = [
  async (req, res) => {
    // Use appropriate middleware based on sender type
    const middleware = req.path.includes("/admin")
      ? checkRole(["super_admin", "support_admin"])
      : authenticateJWT;

    middleware(req, res, async () => {
      const { userType, userId } = getUserTypeAndId(req);
      const { recipient_type, recipient_id, reason, priority = "normal" } = req.body;

      try {
        // Check if a chat already exists with the same details
        const [existingChat] = await db.promise().query(
          `SELECT id FROM unified_chats 
           WHERE initiator_type = ? AND initiator_id = ? 
           AND recipient_type = ? AND recipient_id = ? 
           AND reason = ?`,
          [userType, userId, recipient_type, recipient_id, reason]
        );

        if (existingChat.length > 0) {
          return res.status(200).json({
            message: "Chat already exists",
            messageSv: "Chatten finns redan",
            chat_id: existingChat[0].id,
          });
        }

        // Insert new chat if no duplicate exists
        const [newChat] = await db.promise().query(
          `INSERT INTO unified_chats (
              initiator_type, initiator_id, recipient_type, recipient_id, 
              reason, priority, status
            ) VALUES (?, ?, ?, ?, ?, ?, 'open')`,
          [userType, userId, recipient_type, recipient_id, reason, priority]
        );

        res.status(201).json({
          message: "Chat initiated successfully",
          messageSv: "Chatten initierad framgångsrikt",
          chat_id: newChat.insertId,
        });
      } catch (error) {
        console.error("Error initiating chat:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },
];


// Send message
exports.sendMessage = [
  async (req, res) => {
    const middleware = req.path.includes("/admin")
      ? checkRole(["super_admin", "support_admin"])
      : authenticateJWT;

    middleware(req, res, async () => {
      const { userType, userId } = getUserTypeAndId(req);
      const { chat_id, message } = req.body;
      const file = req.files?.image;

      try {
        // Verify chat access
        const [chatAccess] = await db.promise().query(
          `SELECT * FROM unified_chats 
             WHERE id = ? AND (
               (initiator_type = ? AND initiator_id = ?) OR 
               (recipient_type = ? AND recipient_id = ?)
             )`,
          [chat_id, userType, userId, userType, userId]
        );

        if (chatAccess.length === 0) {
          return res
            .status(403)
            .json({ error: "Unauthorized access to this chat" });
        }

        const image_url = await handleFileUpload(file);

        // Insert message
        await db.promise().query(
          `INSERT INTO unified_chat_messages (
              chat_id, sender_type, sender_id, message, image_url
            ) VALUES (?, ?, ?, ?, ?)`,
          [chat_id, userType, userId, message, image_url]
        );

        // Update read status
        await db.promise().query(
          `UPDATE unified_chats SET 
             initiator_last_read = ?, recipient_last_read = ?
             WHERE id = ?`,
          [
            userType === chatAccess[0].initiator_type,
            userType === chatAccess[0].recipient_type,
            chat_id,
          ]
        );

        res.status(201).json({ message: "Message sent successfully", messageSv: "Meddelandet skickades framgångsrikt" });
      } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },
];

// Get messages
exports.getMessages = [
  async (req, res) => {
    const middleware = req.path.includes("/admin")
      ? checkRole(["super_admin", "support_admin"])
      : authenticateJWT;

    middleware(req, res, async () => {
      const { userType, userId } = getUserTypeAndId(req);
      const { chat_id } = req.params;

      try {
        // Verify chat access first and fetch initiator & recipient details
        const [chatAccess] = await db.promise().query(
          `SELECT 
              uc.*,
              -- Initiator Name
              CASE 
                WHEN uc.initiator_type = 'customer' THEN c2.fullname
                WHEN uc.initiator_type = 'supplier' THEN s2.company_name
                WHEN uc.initiator_type = 'driver' THEN d2.full_name
                WHEN uc.initiator_type = 'admin' THEN 'admin'
              END as initiator_name,

              -- Recipient Name
              CASE 
                WHEN uc.recipient_type = 'customer' THEN c.fullname
                WHEN uc.recipient_type = 'supplier' THEN s.company_name
                WHEN uc.initiator_type = 'driver' THEN d2.full_name
                WHEN uc.recipient_type = 'admin' THEN 'admin'
              END as recipient_name
           FROM unified_chats uc
           LEFT JOIN customers c ON uc.recipient_type = 'customer' AND uc.recipient_id = c.id
           LEFT JOIN suppliers s ON uc.recipient_type = 'supplier' AND uc.recipient_id = s.id
           LEFT JOIN drivers d2 ON uc.recipient_type = 'driver' AND uc.recipient_id = d2.id
           LEFT JOIN customers c2 ON uc.initiator_type = 'customer' AND uc.initiator_id = c2.id
           LEFT JOIN suppliers s2 ON uc.initiator_type = 'supplier' AND uc.initiator_id = s2.id
           WHERE uc.id = ? AND (
             (uc.initiator_type = ? AND uc.initiator_id = ?) OR 
             (uc.recipient_type = ? AND uc.recipient_id = ?)
           )`,
          [chat_id, userType, userId, userType, userId]
        );

        if (chatAccess.length === 0) {
          return res.status(403).json({ error: "Unauthorized access to this chat" });
        }

        const { initiator_name, recipient_name } = chatAccess[0];

        // Mark messages as read
        await db.promise().query(
          `UPDATE unified_chat_messages SET read_status = 'read'
           WHERE chat_id = ? AND sender_type != ?`,
          [chat_id, userType]
        );

        // Get messages with sender details
        const query = `
          SELECT 
            m.*,
            CASE 
              WHEN m.sender_type = 'customer' THEN c.fullname
              WHEN m.sender_type = 'supplier' THEN s.company_name
              WHEN m.sender_type = 'admin' THEN 'admin'
            END as sender_name
          FROM unified_chat_messages m
          LEFT JOIN customers c ON m.sender_type = 'customer' AND m.sender_id = c.id
          LEFT JOIN drivers d ON m.sender_type = 'driver' AND m.sender_id = d.id
          LEFT JOIN suppliers s ON m.sender_type = 'supplier' AND m.sender_id = s.id
          WHERE m.chat_id = ?
          ORDER BY m.created_at ASC
        `;

        const [messages] = await db.promise().query(query, [chat_id]);

        res.status(200).json({
          message: "Messages fetched successfully",
          data: {
            initiator_name,
            recipient_name,
            messages,
          },
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },
];


// Get all conversations for logged in user
exports.getAllUserConversations = [
  async (req, res) => {
    const middleware = req.path.includes("/admin")
      ? checkRole(["super_admin", "support_admin"])
      : authenticateJWT;

    middleware(req, res, async () => {
      const { userType, userId } = getUserTypeAndId(req);

      try {
        const query = `
          SELECT 
            uc.*,
            CASE 
              WHEN uc.initiator_type = ? AND uc.initiator_id = ? THEN
                CASE 
                  WHEN uc.recipient_type = 'customer' THEN c.fullname
                  WHEN uc.recipient_type = 'supplier' THEN s.company_name
                  WHEN uc.recipient_type = 'driver' THEN d.full_name
                  WHEN uc.recipient_type = 'admin' THEN 'admin'
                END
              ELSE
                CASE 
                  WHEN uc.initiator_type = 'customer' THEN c2.fullname
                  WHEN uc.initiator_type = 'supplier' THEN s2.company_name
                  WHEN uc.initiator_type = 'driver' THEN d2.full_name
                  WHEN uc.initiator_type = 'admin' THEN 'admin'
                END
            END as other_party_name,

            -- Initiator Name
            CASE 
              WHEN uc.initiator_type = 'customer' THEN c2.fullname
              WHEN uc.initiator_type = 'supplier' THEN s2.company_name
              WHEN uc.initiator_type = 'driver' THEN d2.full_name
              WHEN uc.initiator_type = 'admin' THEN 'admin'
            END as initiator_name,

            -- Recipient Name
            CASE 
              WHEN uc.recipient_type = 'customer' THEN c.fullname
              WHEN uc.recipient_type = 'supplier' THEN s.company_name
              WHEN uc.recipient_type = 'driver' THEN d.full_name
              WHEN uc.recipient_type = 'admin' THEN 'admin'
            END as recipient_name,

            -- Unread Messages Count
            (
              SELECT COUNT(*) 
              FROM unified_chat_messages ucm 
              WHERE ucm.chat_id = uc.id 
              AND ucm.read_status = 'unread'
              AND ucm.sender_type != ?
              AND ucm.sender_id != ?
            ) as unread_count,

            -- Last Message
            (
              SELECT message 
              FROM unified_chat_messages ucm2
              WHERE ucm2.chat_id = uc.id
              ORDER BY ucm2.created_at DESC
              LIMIT 1
            ) as last_message,

            -- Last Message Time
            (
              SELECT created_at 
              FROM unified_chat_messages ucm3
              WHERE ucm3.chat_id = uc.id
              ORDER BY ucm3.created_at DESC
              LIMIT 1
            ) as last_message_time

          FROM unified_chats uc
          LEFT JOIN customers c ON uc.recipient_type = 'customer' AND uc.recipient_id = c.id
          LEFT JOIN suppliers s ON uc.recipient_type = 'supplier' AND uc.recipient_id = s.id
          LEFT JOIN drivers d ON uc.recipient_type = 'driver' AND uc.recipient_id = d.id
          LEFT JOIN customers c2 ON uc.initiator_type = 'customer' AND uc.initiator_id = c2.id
          LEFT JOIN suppliers s2 ON uc.initiator_type = 'supplier' AND uc.initiator_id = s2.id
          LEFT JOIN drivers d2 ON uc.initiator_type = 'driver' AND uc.initiator_id = d2.id

          WHERE 
            (uc.initiator_type = ? AND uc.initiator_id = ?) OR 
            (uc.recipient_type = ? AND uc.recipient_id = ?)
          ORDER BY last_message_time DESC;
        `;

        const [conversations] = await db.promise().query(query, [
          userType, userId, // For other_party_name CASE
          userType, userId, // For unread count
          userType, userId, // For WHERE clause initiator
          userType, userId, // For WHERE clause recipient
        ]);

        res.status(200).json({
          message: "Conversations fetched successfully",
          messageSv: "Konversationer hämtade framgångsrikt",
          data: conversations.map((conv) => ({
            ...conv,
            is_initiator:
              conv.initiator_type === userType && conv.initiator_id === userId,
            unread_count: parseInt(conv.unread_count),
            last_message_time: conv.last_message_time
              ? new Date(conv.last_message_time)
              : null,
          })),
        });
      } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },
];

