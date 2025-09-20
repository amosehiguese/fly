const express = require("express");
const router = express.Router();

const usersChat = require("../controllers/customerSupplierChat/customerSupplierChat");
const usersSuppliersChat = require("../controllers/customerAdminChat/customerAdminChat");

// supplier and customer chat

router.post("/initiate-chat", usersChat.initiateChat); // Customer starts a chat

router.get("/suppliers", usersChat.getAllSuppliers); // Get all suppliers

router.post("/customer/send-message", usersChat.sendCustomerMessage); // Customer sends message
router.post("/supplier/send-message", usersChat.sendSupplierMessage); // Supplier sends message

router.get("/customer/chat/:chat_id", usersChat.getCustomerChatMessages); // Customer fetches chat messages
router.get("/supplier/chat/:chat_id", usersChat.getSupplierChatMessages); // Supplier fetches chat messages
router.get("/admin/chat/:chat_id", usersChat.getAdminChatMessages); // Supplier fetches chat messages

router.get("/customer/conversations", usersChat.getCustomerConversations); // Customer fetches their chat list
router.get("/supplier/conversations", usersChat.getSupplierConversations); // Supplier fetches their chat list
router.get("/admin/conversations", usersChat.getAdminConversations); // Supplier fetches their chat list

// admin and customer chat
// Customer routes
router.post("/initiate", usersSuppliersChat.initiateChat);
router.post("/customer/message", usersSuppliersChat.sendCustomerMessage);
router.get(
  "/customer/messages/:chat_id",
  usersSuppliersChat.getCustomerChatMessages
);
router.get(
  "/customer/conversations",
  usersSuppliersChat.getCustomerConversations
);

// Admin routes
router.post("/admin/message", usersSuppliersChat.sendAdminMessage);
router.get("/admin/messages/:chat_id", usersSuppliersChat.getAdminChatMessages);
router.get("/admin/conversations", usersSuppliersChat.getAdminConversations);

module.exports = router;
