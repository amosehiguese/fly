const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../../utils/notificationService");
const emailService = require("../../../utils/emailService");
const { format, differenceInCalendarMonths, addMonths } = require("date-fns");
const { check, validationResult } = require("express-validator");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");

exports.fundsOverview = [
  checkRole(["super_admin", "finance_admin", "support_admin"]),
  async (req, res) => {
    try {
      const totalMoneyQuery = `SELECT IFNULL(SUM(total_price), 0) AS total_money FROM checkout`;
      const moneyInQuery = `SELECT IFNULL(SUM(amount_paid + remaining_balance), 0) AS money_in FROM checkout`;
      const moneyPaidOutQuery = `SELECT IFNULL(SUM(amount), 0) AS money_paid_out FROM withdrawal_requests WHERE status = 'completed'`;
      const totalWithdrawalRequestQuery = `SELECT IFNULL(SUM(amount), 0) AS total_withdrawal_request FROM withdrawal_requests`;
      const readyForDisbursementQuery = `SELECT IFNULL(SUM(amount), 0) AS ready_for_disbursement FROM withdrawal_requests WHERE status = 'pending'`;

      // Execute queries in parallel using the correct syntax
      const results = await Promise.all([
        db.promise().query(totalMoneyQuery),
        db.promise().query(moneyInQuery),
        db.promise().query(moneyPaidOutQuery),
        db.promise().query(totalWithdrawalRequestQuery),
        db.promise().query(readyForDisbursementQuery),
      ]);

      // Extract values correctly from query results
      const totalMoney = results[0][0][0]?.total_money || 0;
      const moneyIn = results[1][0][0]?.money_in || 0;
      const moneyPaidOut = results[2][0][0]?.money_paid_out || 0;
      const totalWithdrawalRequest =
        results[3][0][0]?.total_withdrawal_request || 0;
      const readyForDisbursement =
        results[4][0][0]?.ready_for_disbursement || 0;

      // Prepare response data
      const overview = {
        total_money: totalMoney,
        money_in: moneyIn,
        money_paid_out: moneyPaidOut,
        total_withdrawal_request: totalWithdrawalRequest,
        ready_for_disbursement: readyForDisbursement,
      };

      // Log admin activity with correct action & details
      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_FUNDS_OVERVIEW",
        `Viewed funds overview: ${JSON.stringify(overview)}`,
        null,
        "finance"
      );

      // Send response
      return res.json({ success: true, data: overview });
    } catch (error) {
      console.error("Error fetching funds overview:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
];

exports.completedPayments = [
  checkRole(["super_admin", "finance_admin", "support_admin"]),
  async (req, res) => {
    try {
      // Query to fetch completed payments where payment_status is 'completed'
      const query = `
          SELECT 
            c.order_id,
            c.customer_name,
            b.quotation_type AS move_type,
            b.created_at AS date,
            (c.amount_paid + c.remaining_balance) AS amount_paid
          FROM checkout c
          JOIN bids b ON c.order_id = b.order_id
          WHERE c.payment_status = 'completed'
        `;

      // Execute query
      const [results] = await db.promise().query(query);

      // Log admin activity
      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_COMPLETED_PAYMENTS",
        `Viewed completed payments: ${JSON.stringify(results)}`,
        null,
        "finance"
      );

      // Send response
      return res.json({ success: true, data: results });
    } catch (error) {
      console.error("Error fetching completed payments:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
];

exports.totalWithdrawn = [
  checkRole(["super_admin", "finance_admin", "support_admin"]),
  async (req, res) => {
    try {
      // Query to fetch completed withdrawal requests
      const query = `
          SELECT 
            wr.id AS request_id,
            s.company_name AS supplier_name,
            wr.amount AS amount_requested,
            wr.request_date AS date,
            wr.status
          FROM withdrawal_requests wr
          JOIN suppliers s ON wr.supplier_id = s.id
          WHERE wr.status = 'completed'
        `;

      // Execute query
      const [results] = await db.promise().query(query);

      // Log admin activity
      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_TOTAL_WITHDRAWN",
        `Viewed total withdrawn requests: ${JSON.stringify(results)}`,
        null,
        "finance"
      );

      // Send response
      return res.json({ success: true, data: results });
    } catch (error) {
      console.error("Error fetching total withdrawn requests:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
];

exports.getWithdrawDetailsById = [
  checkRole(["super_admin", "finance_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { withdrawal_id } = req.params;

      // Ensure withdrawal_id is provided
      if (!withdrawal_id) {
        return res
          .status(400)
          .json({ success: false, message: "Withdrawal ID is required" });
      }

      // Query to fetch a specific withdrawal request by ID
      const query = `
          SELECT 
            wr.id AS request_id,
            s.company_name AS supplier_name,
            wr.amount AS amount_requested,
            wr.request_date AS date,
            wr.status
          FROM withdrawal_requests wr
          JOIN suppliers s ON wr.supplier_id = s.id
          WHERE wr.id = ?
        `;

      // Execute query
      const [results] = await db.promise().query(query, [withdrawal_id]);

      // If no record found
      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Withdrawal request not found" });
      }

      // Log admin activity
      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_WITHDRAWAL_DETAILS",
        `Viewed withdrawal details for ID: ${withdrawal_id}`,
        null,
        "finance"
      );

      // Send response
      return res.json({ success: true, data: results[0] });
    } catch (error) {
      console.error("Error fetching withdrawal details:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
];

exports.readyForDisbursement = [
  checkRole(["super_admin", "finance_admin", "support_admin"]),
  async (req, res) => {
    try {
      // Query to fetch pending withdrawal requests
      const query = `
          SELECT 
            wr.id AS request_id,
            s.company_name AS supplier_name,
            wr.amount AS amount_requested,
            wr.request_date AS request_date,
            wr.status
          FROM withdrawal_requests wr
          JOIN suppliers s ON wr.supplier_id = s.id
          WHERE wr.status = 'pending'
        `;

      // Execute query
      const [results] = await db.promise().query(query);

      // Log admin activity
      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_READY_FOR_DISBURSEMENT",
        `Viewed ready for disbursement requests: ${JSON.stringify(results)}`,
        null,
        "finance"
      );

      // Send response
      return res.json({ success: true, data: results });
    } catch (error) {
      console.error("Error fetching ready for disbursement requests:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
];

exports.updateWithdrawalStatus = [
  checkRole(["super_admin", "finance_admin"]),
  [
    check("withdrawal_id")
      .isInt()
      .withMessage("Valid withdrawal ID is required"),
    check("status")
      .isIn(["completed", "rejected", "pending"])
      .withMessage("Valid status is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { withdrawal_id, status } = req.body;
    const admin_id = req.admin.id;

    let connection;
    try {
      connection = await db.promise().getConnection();
      await connection.beginTransaction();

      // Get withdrawal request details
      const [withdrawalDetails] = await connection.query(
        `SELECT 
            wr.*, 
            s.email AS supplier_email, 
            s.company_name AS supplier_name 
          FROM withdrawal_requests wr 
          JOIN bids b ON wr.bid_id = b.id 
          JOIN suppliers s ON b.supplier_id = s.id 
          WHERE wr.id = ? AND wr.status = 'pending'`,
        [withdrawal_id]
      );

      if (withdrawalDetails.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: "Withdrawal request not found or not in pending status",
        });
      }

      const withdrawal = withdrawalDetails[0];

      // Update withdrawal status
      const updateData = {
        status,
        paid_date: status === "completed" ? new Date() : null,
      };

      await connection.query("UPDATE withdrawal_requests SET ? WHERE id = ?", [
        updateData,
        withdrawal_id,
      ]);

      await connection.commit();
      connection.release();

      // Send email notification
      const emailTemplate = {
        completed: {
          subject: "Withdrawal Request Completed",
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Withdrawal Request Completed</h2>
                <p>Dear ${withdrawal.supplier_name},</p>
                <p>Your withdrawal request has been successfully processed.</p>
                <p><strong>Amount:</strong> $${parseFloat(
                  withdrawal.amount
                ).toFixed(2)}</p>
                <p><strong>Transaction Reference:</strong> ${
                  withdrawal.transaction_reference
                }</p>
                <p><strong>Bank Name:</strong> ${withdrawal.bank_name}</p>
                <p><strong>IBAN:</strong> ${withdrawal.iban}</p>
                <p>The funds should be reflected in your account shortly.</p>
                <p>Best regards,<br>Your Platform Team</p>
              </div>
            `,
        },
        rejected: {
          subject: "Withdrawal Request Update",
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Withdrawal Request Status Update</h2>
                <p>Dear ${withdrawal.supplier_name},</p>
                <p>Your withdrawal request has been reviewed but could not be processed at this time.</p>
                <p><strong>Amount:</strong> $${parseFloat(
                  withdrawal.amount
                ).toFixed(2)}</p>
                <p>Please contact our support team for more information.</p>
                <p>Best regards,<br>Your Platform Team</p>
              </div>
            `,
        },
      };

      if (status !== "pending" && emailTemplate[status]) {
        await emailService.sendEmail(
          withdrawal.supplier_email,
          emailTemplate[status]
        );

        // Create in-app notification
        await notificationService.createNotification({
          recipientId: withdrawal.supplier_email,
          recipientType: "supplier",
          title:
            status === "completed"
              ? "Withdrawal Completed"
              : "Withdrawal Update",
          message:
            status === "completed"
              ? `Your withdrawal request for $${parseFloat(
                  withdrawal.amount
                ).toFixed(2)} has been processed.`
              : `Your withdrawal request for $${parseFloat(
                  withdrawal.amount
                ).toFixed(2)} has been reviewed but could not be processed.`,
          type: "withdrawal",
          referenceId: withdrawal_id,
          referenceType: "withdrawal",
        });
      }

      await logAdminActivity(
        req,
        admin_id,
        "UPDATE_WITHDRAWAL_STATUS",
        `Updated withdrawal request #${withdrawal_id} status to ${status}`,
        withdrawal_id,
        "withdrawal"
      );

      res.status(200).json({
        message: `Withdrawal request status updated to ${status} successfully`,
        withdrawal_id,
      });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error updating withdrawal status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (connection) connection.release();
    }
  },
];
