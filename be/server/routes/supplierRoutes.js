const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const ongoingSupplierOrders = require("../controllers/ongoingOrderController");
const orderStatus = require("../controllers/orderStatusController");
const fundsDisbursement = require("../controllers/supplierFundsController");
const supplierBid = require("../controllers/supplierBid/supplierBids");
const orderController = require("../controllers/supplierOrders/supplierOrder");
const supplierRegister = require("../controllers/supplier/registerSupplier");
const driverDetails = require("../controllers/supplier/supplierDriverRelationship");
const assignDriver = require("../controllers/supplier/assignJobDrivers");
const driverRatings = require("../controllers/drivers/reviewDetails");
const acceptedJobs = require('../controllers/supplier/viewAcceptedJobs')
const {
  authenticateJWT,
  supplierIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");

// get requests
router.get(
  "/view-quotation-with-bid/:bid_id",
  supplierController.viewQuotationWithBid
);
router.get("/marketplace", supplierController.marketPlace);
router.get(
  "/marketplace/quotation/:table_name/:id",
  supplierController.viewQuotationDetails
);
router.get("/earnings", supplierController.getSupplierEarnings);

// funsd disbursement
router.post("/request-funds", fundsDisbursement.withdrawFundsReq);
router.get("/:bidId/withdrawal-amount", fundsDisbursement.getTotalBidAmount);

router.get("/dashboard", supplierController.supplierDashboard);

// getting by id
router.get("/orders/:order_id", supplierController.getOrderById);
router.get("/disputes/:dispute_id", supplierController.getDisputeById);
router.get(
  "/quotations/:quotation_type/:quotation_id",
  supplierController.getQuotationById
);

// supplier dashboard
router.get("/orders", orderController.getSupplierOrders);
router.get("/disputes", orderController.getSupplierDisputes);
router.get("/order-details/:orderId", orderController.orderDetails);
router.get("/quotation-details/:orderId", orderController.orderDetailsDetailed);

// post Requests
router.post("/register", supplierRegister.registerSupplier);
router.post("/login", supplierController.supplierLogin);
router.post("/customer-quotations", supplierController.customerQuotations);
router.post("/send-bid", supplierBid.sendBid);

// supplier ongoing orders route
router.get(
  "/ongoing-orders/:bid_id",
  ongoingSupplierOrders.supplierOngoingOrders
);

// supplier order status update route
router.post("/update-order-status", orderStatus.moverOrderUpdate);

router.post("/logout", supplierController.supplierLogout);

router.get("/my-bids", supplierController.getSupplierBids);

// supplier getting drivers details plus ratings
router.get(
  "/drivers/all",
  authenticateJWT,
  supplierIsLoggedIn,
  driverRatings.getAllSupplierDrivers
);
router.get(
  "/drivers/ratings/:driverId",
  authenticateJWT,
  supplierIsLoggedIn,
  driverRatings.driversDetailsById
);



// drivers relationship with supplier
router.get(
  "/drivers",
  authenticateJWT,
  supplierIsLoggedIn,
  driverDetails.getSupplierDrivers
);

router.get(
  "/drivers/:driverId",
  authenticateJWT,
  supplierIsLoggedIn,
  driverDetails.getSupplierDriversById
);

router.post(
  "/drivers/:orderId/:driverId/assign",
  authenticateJWT,
  supplierIsLoggedIn,
  assignDriver.assignJobDrivers
);


// supplier getting accepted jobs
router.get(
  "/accepted-jobs",
  authenticateJWT,
  supplierIsLoggedIn,
  acceptedJobs.viewAcceptedJobs
);
module.exports = router;
