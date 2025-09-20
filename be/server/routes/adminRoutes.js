const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminSupplierDetails = require("../controllers/supplierDetailsControllers");
const adminFundsDisbursement = require("../controllers/fundsDisbursementController");
const adminLogs = require("../controllers/adminLogsController");
const acceptBid = require("../controllers/adminBids/acceptBidsController");
const quotationCount = require("../controllers/quotationController");
const auctionSettings = require("../controllers/auctionSettings/auctionSettings");
const adminFunds = require("../controllers/adminFundsView/adminFundsController");
const supplierDetails = require("../controllers/supplier/registerSupplier");
const resetPassword = require("../controllers/adminEditPassword/adminEditPassword");

// Authentication routes
router.post("/login", adminController.adminLogin);

// Admin management (Super admin only)
router.post("/create", adminController.createAdmin);
router.get("/list", adminController.listAdmins);

// Profile route
router.get("/profile", adminController.getProfile);
router.get("/monthly-bids-total", adminController.getMonthlyBidsTotal);

// quotation route
router.get("/quotations", adminController.getAllQuotations);
// router.post('/search-quotations', adminController.searchQuotations);
router.get("/quotations/:type/:id", adminController.getQuotationById);
router.delete("/quotations/:type/:id", adminController.deleteQuotation);
router.get("/quotation-bid/:type/:id", adminController.getQuotationByIdWithBid);

// bid routes
router.get("/bids", adminController.allBids);
router.post("/search-bids", adminController.searchBids);
router.get("/bids/:id", adminController.getBidById);
router.delete("/bids/:id", adminController.deleteBid);

// order roures
router.get("/orders", adminController.orders);
router.get(
  "/orders-detailed/:orderId",
  adminController.adminOrderDetailsDetailed
);
// router.get('/orders-checkout/:order_id', )
router.post("/orders/search", adminController.searchOrders);

router.get("/quotations-bids", adminController.fetchQuotationsAndBids);

router.get("/totalcount", adminController.getTotalCounts);
router.get("/recent-activities", adminController.getRecentAdminActivities);
router.put("/bids/:id", acceptBid.acceptBid);
router.get("/marketplace", adminController.marketPlace);
router.get("/suppliers/search", adminController.supplierSearch);
router.post("/auction/toggle", adminController.toggleAuctionMode);
router.get("/auction/status", adminController.getAuctionStatus);
router.post("/set-auction", auctionSettings.updateAuctionSettings);

// Fixed percentage routes

// suppliers
router.post("/suppliers/approve", adminController.approveSuppliers);
router.get("/suppliers", adminSupplierDetails.supplierDetails);
router.get("/suppliers/:supplier_id", supplierDetails.getSupplierDetails);

// funds disbursement
router.post("/funds/disburse", adminController.fundsDisbursement);

router.get("/funds-overview", adminFunds.fundsOverview);
router.get("/completed-payment", adminFunds.completedPayments);
router.get("/total-withdrawn", adminFunds.totalWithdrawn);
router.get(
  "/total-withdrawn/:withdrawal_id",
  adminFunds.getWithdrawDetailsById
);
router.get("/disbursement-ready", adminFunds.readyForDisbursement);
router.put("/withdrawals/status", adminFunds.updateWithdrawalStatus);

router.get(
  "/disbursement-details",
  adminFundsDisbursement.getDisbursementDetails
);
router.post(
  "/process-disbursement",
  adminFundsDisbursement.processDisbursement
);
router.get("/withdrawal-request", adminFundsDisbursement.withdrawalRequest);
router.get(
  "/pending-withdrawal-request",
  adminFundsDisbursement.pendingWithdrawalRequest
);

// checking admin logs
router.get("/admin-logs", adminLogs.getAdminLogs);

// delete admin
router.delete("/delete/:adminId", adminController.deleteAdmins);

// admin quotation management
router.post("/quotation-count", quotationCount.customer_quotation_all);

// reset password
router.post("/reset-password", resetPassword.resetPassword);
router.post("/request-reset-code", resetPassword.requestPasswordReset);

// logout
router.post("/logout", adminController.adminLogout);

// request logs
router.get("/logs", adminController.viewLogs); // View logs
router.get("/logs/download", adminController.downloadLogs); // Download logs

module.exports = router;
