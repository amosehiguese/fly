const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/chatting/conversation");
const { authenticateJWT, checkRole } = require("../controllers/loginController/authMiddleware");

// Customer/Supplier routes
router.post("/initiate", authenticateJWT, conversationController.initiateChat);
router.post("/message", authenticateJWT, conversationController.sendMessage);
router.get("/messages/:chat_id", authenticateJWT, conversationController.getMessages);
router.get("/conversations", authenticateJWT, conversationController.getAllUserConversations);

// Admin routes
router.post("/admin/initiate", checkRole(["super_admin", "support_admin"]), conversationController.initiateChat);
router.post("/admin/message", checkRole(["super_admin", "support_admin"]), conversationController.sendMessage);
router.get("/admin/messages/:chat_id", checkRole(["super_admin", "support_admin"]), conversationController.getMessages);
router.get("/admin/conversations", checkRole(["super_admin", "support_admin"]), conversationController.getAllUserConversations);

module.exports = router;