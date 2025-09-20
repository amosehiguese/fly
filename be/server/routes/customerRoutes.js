const express = require('express');
const router = express.Router(); 
const customerController = require('../controllers/customerController');
const checkoutController = require("../controllers/checkoutController")
const ongoingOrderController = require('../controllers/ongoingOrderController');
const orderStatus = require('../controllers/orderStatusController')
const customerMainPayment = require('../payments/mainPaymentController')
const customerOrder = require('../controllers/customerOrders/orderDetailsController')

// Define routes
router.get('/notifications', customerController.getNotifications);
router.get('/complaints', customerController.getCustomerComplaints);
router.get('/dashboard', customerController.dashboard);


// getting orders by order id
router.get('/orders/:orderId', customerOrder.orderDetails);

// post requests
router.post('/register', customerController.register);
router.post('/update-user', customerController.customerUpdateInfo);


// router.post('/stripe-payment', customerController.customerPayment);
router.post('/stripe-payment', customerMainPayment.customerPayment);
// router.post('/initiate-dispute', customerController.initiateDispute);


router.post('/complaints', customerController.fileComplaint);
router.post('/logout', customerController.userLogout);

// checkout Route
router.get('/checkout/:order_id', checkoutController.checkout)

// admin, customer, supplier checking checkout
router.get('/checkout-info', checkoutController.getCheckout)

// ongoing orders
router.get('/ongoing-orders/:bid_id', ongoingOrderController.customerOngoingOrders);

// customer updating order status
router.post('/update-order-status', customerOrder.customerOrderUpdate);

// reject a bid
router.post('/reject-bid', customerController.rejectBid)

// getting all quotation
router.get('/quotation/:quotation_id/:quotation_type', customerOrder.quotationDetails)


module.exports = router; 