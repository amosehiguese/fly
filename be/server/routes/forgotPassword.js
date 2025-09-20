const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPassword/forgotPassword');


// routes/forgotPassword.js
router.post("/send-code", forgotPasswordController.sendForgotPasswordCode);
router.post("/reset", forgotPasswordController.resetPassword);

module.exports = router;
