const express = require('express');
const router = express.Router();
const mailingController = require('../controllers/mailing/mailing');


router.post('/send-verification', mailingController.sendVerificationEmail);
router.post('/verify-code', mailingController.verifyCode);

module.exports = router;