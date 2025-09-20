const express = require("express");
const router = express.Router();
const supplierChatController = require("../controllers/supplierChat/supplierAdminChat");

router.post("/initiate", supplierChatController.initiateSupplierChat); // Supplier starts a chat
router.post("/message", supplierChatController.sendSupplierMessage); // Supplier sends message
router.get("/conversations", supplierChatController.getSupplierConversations); // Supplier fetches their chat list
router.get("/messages/:chat_id", supplierChatController.getSupplierChatMessages); // Supplier fetches chat messages
router.patch("/chat/:chat_id/close", supplierChatController.closeSupplierChat);

// admin part
router.get("/admin/conversations", supplierChatController.getAdminSupplierConversations); // Admin fetches all supplier conversations
router.get("/admin/messages/:chat_id", supplierChatController.getAdminSupplierChatMessages); // Admin fetches chat messages
router.post("/admin/message", supplierChatController.sendAdminResponseToSupplier)



module.exports = router;
