const express = require('express');
const router = express.Router();
const { 
  getAdminConversations, 
  adminReplyToConversation,
  getAdminConversationById
} = require('../controllers/adminMessages');

router.get('/conversations', getAdminConversations);
router.post('/conversations/:conversation_id/reply', adminReplyToConversation);
router.get('/conversations/:order_id', getAdminConversationById);

module.exports = router; 