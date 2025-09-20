const express = require('express');
const router = express.Router(); 
const checkoutController = require('../controllers/checkoutController')


router.get('/details/:order_id', checkoutController.getCheckout)

module.exports = router;