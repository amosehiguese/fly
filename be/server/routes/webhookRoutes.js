const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/webhookController");

const handlePartialPaymentWebhook = require("../controllers/partialPaymentWebhookController");

// This route needs raw body for Stripe signature verification
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleWebhook
);

router.post(
  "/stripe-partial-payment",
  express.raw({ type: "application/json" }),
  handlePartialPaymentWebhook
);

module.exports = router;
