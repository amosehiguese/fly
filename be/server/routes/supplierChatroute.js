const express = require("express");
const router = express.Router();
const supplierChatController = require("../controllers/supplierChatController");



// supplier chatting routes

// Admin routes
router.post("/admin/send", supplierChatController.adminSendMessage);
router.get("/admin/:dispute_id/messages", supplierChatController.getAdminSupplierChatMessages);

// Supplier routes
router.post("/supplier/send", supplierChatController.supplierSendMessage);
router.get("/supplier/:dispute_id/messages", supplierChatController.getSupplierChatMessages);
module.exports = router;
