const db = require("../../db/connect");
const notificationService = require("../../utils/notificationService");
const emailService = require("../../utils/emailService");
const {
  authenticateJWT,
  supplierIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");

exports.withdrawFundsReq = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    try {
      const supplierId = req.user.id;
      const { bidId, amount, bankName, iban, accountNumber, swift } = req.body;

      // Check if there's an existing withdrawal request for this bid
      const [[existingWithdrawal]] = await db.promise().query(
        `SELECT status FROM withdrawal_requests 
         WHERE bid_id = ? 
         ORDER BY request_date DESC 
         LIMIT 1`,
        [bidId]
      );

      if (existingWithdrawal && existingWithdrawal.status !== "failed") {
        return res.status(400).json({
          success: false,
          message:
            "A withdrawal request for this bid is already in progress or completed.",
          messageSv:
            "En begäran om uttag för detta bud är redan under behandling eller slutförd.",
        });
      }

      // Verify if the bid exists and belongs to the supplier, and get the total amount from bids table
      const [[bidVerification]] = await db.promise().query(
        `SELECT b.id AS bid_id, b.supplier_id, b.disbursement_status, 
                (b.moving_cost + b.additional_services + b.truck_cost) AS total_amount,
                CASE 
                    WHEN b.id < 10 THEN CONCAT('WD-000', b.id)
                    WHEN b.id < 100 THEN CONCAT('WD-00', b.id)
                    WHEN b.id < 1000 THEN CONCAT('WD-0', b.id)
                    ELSE CONCAT('WD-', b.id)
                END as withdrawal_id
         FROM bids b
         WHERE b.id = ? 
         AND b.supplier_id = ? 
         AND b.disbursement_status = 'pending'`,
        [bidId, supplierId]
      );

      if (!bidVerification) {
        return res.status(400).json({
          success: false,
          message: "Invalid bid or bid already processed",
          messageSv: "Ogiltigt bud eller bud har redan behandlats.",
        });
      }

      // Verify if the amount matches the calculated total amount from bids table
      if (Number(bidVerification.total_amount) !== Number(amount)) {
        return res.status(400).json({
          success: false,
          message: "Withdrawal amount must match the total bid amount",
          messageSv: "Uttagsbeloppet måste matcha det totala budbeloppet.",
          debug: {
            totalAmount: bidVerification.total_amount,
            requestedAmount: amount,
          },
        });
      }

      // Insert withdrawal request into the withdrawal_requests table
      const [withdrawalResult] = await db.promise().query(
        `INSERT INTO withdrawal_requests 
            (supplier_id, bid_id, amount, bank_name, iban, accountNumber, swift, status, request_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [supplierId, bidId, amount, bankName, iban, accountNumber, swift]
      );

      const withdrawalId = withdrawalResult.insertId;

      // Retrieve the created withdrawal request details
      const [[withdrawalDetails]] = await db.promise().query(
        `SELECT wr.*, 
            CASE 
                WHEN wr.id < 10 THEN CONCAT('WD-000', wr.id)
                WHEN wr.id < 100 THEN CONCAT('WD-00', wr.id)
                WHEN wr.id < 1000 THEN CONCAT('WD-0', wr.id)
                ELSE CONCAT('WD-', wr.id)
            END as withdrawal_id
         FROM withdrawal_requests wr
         WHERE wr.id = ?`,
        [withdrawalId]
      );

      // Update the bid disbursement status to 'processing'
      await db.promise().query(
        `UPDATE bids 
         SET disbursement_status = 'processing' 
         WHERE id = ?`,
        [bidId]
      );

      // Send notification to the supplier
      await notificationService.createNotification({
        recipientId: supplierId,
        recipientType: "supplier",
        title: "Begäran om uttag inlämnad",
        message: `Din begäran om uttag på ${amount} har skickats in framgångsrikt. Referens: ${withdrawalDetails.withdrawal_id}`,
        type: "WITHDRAWAL_REQUEST",
        referenceId: withdrawalId,
        referenceType: "withdrawal",
      });

      // Send email notification to the supplier
      await emailService.sendEmail(
        req.user.email,
        emailService.templates.withdrawalRequest({
          withdrawalId: withdrawalDetails.withdrawal_id,
          amount: amount,
          bankName: bankName,
          iban: iban,
          accountNumber: accountNumber,
          swift: swift,
          supplierName: req.user.name || "Valued Supplier",

        })
      );

      return res.status(200).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        messageSv: "Uttagsbegäran skickad framgångsrikt",
        data: {
          withdrawalId: withdrawalDetails.withdrawal_id,
          amount,
          bankName,
          iban,
          status: "pending",
          requestDate: withdrawalDetails.request_date,
        },
      });
    } catch (error) {
      console.error("Error processing withdrawal request:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
];

exports.getTotalBidAmount = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    try {
      const supplierId = req.user.id;
      const { bidId } = req.params;

      // Fetch the total amount from the bids table
      const [[bidAmount]] = await db.promise().query(
        `SELECT (b.moving_cost + b.additional_services + b.truck_cost) AS total_amount
         FROM bids b
         WHERE b.id = ? AND b.supplier_id = ?`,
        [bidId, supplierId]
      );

      if (!bidAmount || bidAmount.total_amount === null) {
        return res.status(404).json({
          success: false,
          message: "Bid not found or unauthorized access",
          messageSv: "Bud hittades inte eller obehörig åtkomst.",
        });
      }

      return res.status(200).json({
        success: true,
        totalAmount: bidAmount.total_amount,
      });
    } catch (error) {
      console.error("Error fetching total bid amount:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
];
