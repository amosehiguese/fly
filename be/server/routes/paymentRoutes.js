const express = require("express");
const router = express.Router();
const { paymentSheet } = require("../controllers/paymentController");

router.post("/payment-sheet", paymentSheet);

module.exports = router;
