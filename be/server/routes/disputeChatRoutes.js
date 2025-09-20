const express = require("express");
const router = express.Router();
const disputeChatController = require("../controllers/disputeChatController");


// customer chat routes
// Admin routes
router.post("/admin/send", disputeChatController.adminSendMessage);
router.get("/admin/:dispute_id/messages", disputeChatController.getAdminChatMessages);

// Customer routes
router.post("/customer/send", disputeChatController.customerSendMessage);
router.get("/customer/:dispute_id/messages", disputeChatController.getCustomerChatMessages);

// supplier chatting with the admin and likewise
router.post("/supplier-chat-admin", disputeChatController.sendSupplierMessageToAdmin);
router.post("/admin-chat-supplier", disputeChatController.sendAdminMessageToSupplier);
router.get("/supplier-chat/:dispute_id", disputeChatController.getAdminSupplierChatMessages);
router.get("/admin-chat/:dispute_id", disputeChatController.getAdminViewSupplierChat);


// updating dispute status
router.post("/update-dispute-status", disputeChatController.updateDisputeResolution)
router.get("/dispute-details/:dispute_id", disputeChatController.getDisputeResolution)


// getting disputes
router.get('/admin-disputes/customer', disputeChatController.getAllAdminCustomerChats)
router.get('/admin-disputes/supplier', disputeChatController.getAllAdminSupplierChats)
router.get('/supplier-disputes', disputeChatController.getSupplierDisputesWithChats)
router.get('/customer-disputes', disputeChatController.getCustomerDisputesWithChats)


// Reading dispute messages


module.exports = router;
