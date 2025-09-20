const express = require('express');
const router = express.Router();
const tippingController = require('../controllers/tipping/tippingController');
const { handleTipWebhook } = require('../controllers/tipping/tipWebhookController');
const { userIsLoggedIn, driverIsLoggedIn, authenticateJWT, supplierIsLoggedIn, checkRole } = require('../controllers/loginController/authMiddleware');
const { check } = require('express-validator');

// Customer routes
router.post('/order/:orderId/tip', authenticateJWT, userIsLoggedIn, tippingController.addTip);

// Driver routes
router.get('/driver/tips', authenticateJWT, driverIsLoggedIn, tippingController.getDriverTips);


// Supplier routes
router.get('/supplier/driver-tips', authenticateJWT, supplierIsLoggedIn, tippingController.getSupplierDriverTips);

// Admin routes
router.get('/admin/tips', checkRole(['super_admin', 'financial_admin']), tippingController.getAdminTips);
router.post('/admin/mark-paid', checkRole(['super_admin', 'financial_admin']), tippingController.markTipsAsPaid);

router.post('/webhook', handleTipWebhook);

module.exports = router; 