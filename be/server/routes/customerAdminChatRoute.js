const express = require('express');
const router = express.Router();
const customerAdminChatController = require('../controllers/customerAdminChat/customerAdminChat');

// Customer routes
router.post('/initiate', customerAdminChatController.initiateChat);
router.post('/customer/message', customerAdminChatController.sendCustomerMessage);
router.get('/customer/messages/:chat_id', customerAdminChatController.getCustomerChatMessages);
router.get('/customer/conversations', customerAdminChatController.getCustomerConversations);

// Admin routes
router.post('/admin/message', customerAdminChatController.sendAdminMessage);
router.get('/admin/messages/:chat_id', customerAdminChatController.getAdminChatMessages);
router.get('/admin/conversations', customerAdminChatController.getAdminConversations);

module.exports = router;