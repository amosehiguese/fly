const db = require("../../db/connect");
const { check, validationResult } = require("express-validator");
const notificationService = require("../../utils/notificationService");
const emailService = require("../../utils/emailService");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

function isValidDate(date) {
  if (!date) return false;
  const timestamp = Date.parse(date);
  return !isNaN(timestamp) && timestamp > 0;
}

// 1. Get Disbursement Details
exports.getDisbursementDetails = (req, res) => {    
  const { order_id } = req.params;

  const query = `
  SELECT 
      b.order_id,
      b.estimated_completion_date AS move_date,
      ab.final_price AS total_price,
      ab.order_status,
      ab.updated_at AS updated_at,
      s.id AS supplier_id,
      s.company_name,
      s.email AS supplier_email,
      s.phone AS supplier_phone,
      s.address,
      s.city,
      s.organization_number,
      c.fullname AS customer_name,
      c.email AS customer_email,
      c.phone_num AS customer_phone,
      q.service_type,
      q.pickup_address,
      q.delivery_address,
      q.date,
      q.distance,
      q.latest_date,
      q.name,
      q.email AS quotation_email,
      q.phone AS quotation_phone,
      q.services
  FROM bids b
  JOIN accepted_bids ab ON b.id = ab.bid_id
  JOIN suppliers s ON b.supplier_id = s.id
  JOIN (
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name, 
          email, 
          phone, 
          services,
          'private_move' AS type FROM private_move
      UNION ALL
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name, 
          email, 
          phone, 
          services,
          'moving_cleaning' FROM moving_cleaning
      UNION ALL
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name, 
          email, 
          phone, 
          services,
          'heavy_lifting' FROM heavy_lifting
      UNION ALL
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name, 
          email, 
          phone, 
          services,
          'company_relocation' FROM company_relocation
      UNION ALL
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name, 
          email, 
          phone, 
          services,
          'estate_clearance' FROM estate_clearance
      UNION ALL
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name,  
          email, 
          phone, 
          services,
          'evacuation_move' FROM evacuation_move
      UNION ALL
      SELECT 
          id, 
          service_type, 
          pickup_address, 
          delivery_address, 
          date, 
          distance, 
          latest_date, 
          name,  
          email, 
          phone, 
          services,
          'secrecy_move' FROM secrecy_move
  ) q ON b.quotation_id = q.id AND b.quotation_type = q.type
  JOIN customers c ON q.email = c.email
  WHERE b.order_id = ?;
  `;

  db.query(query, [order_id], (err, results) => {
    if (err) {
      console.error("Error fetching disbursement details:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No disbursement details found for this order." });
    }

    const formattedDisbursements = results.map((detail) => ({
      order_id: detail.order_id,
      move_date: detail.move_date,
      total_price: detail.total_price,
      order_status: detail.order_status,
      updated_at: detail.updated_at,
      supplier: {
        id: detail.supplier_id,
        company_name: detail.company_name,
        email: detail.supplier_email,
        phone: detail.supplier_phone,
        address: detail.address,
        city: detail.city,
        organization_number: detail.organization_number,
      },
      customer: {
        name: detail.customer_name,
        email: detail.customer_email,
        phone: detail.customer_phone,
      },
      quotation: {
        service_type: detail.service_type,
        pickup_address: detail.pickup_address,
        delivery_address: detail.delivery_address,
        date: detail.date,
        distance: detail.distance,
        latest_date: detail.latest_date,
        name: detail.name,
        email: detail.quotation_email,
        phone: detail.quotation_phone,
        services: detail.services,
      },
    }));

    res.json({ disbursementDetails: formattedDisbursements });
  });
};

// 2. Process Disbursement
exports.processDisbursement = [
  checkRole(["super_admin", "finance_admin"]),
  [
    check("bid_id").isInt().withMessage("Valid bid ID is required"),
    check("transaction_reference")
      .isString()
      .notEmpty()
      .withMessage("Transaction reference is required"),
    check("notes").optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bid_id, transaction_reference, notes } = req.body;
    const admin_id = req.admin.id;

    const connection = await db.promise().getConnection();

    try {
      await connection.beginTransaction();

      // Update bid status
      const [updateResult] = await connection.query(
        `UPDATE bids
         SET 
           disbursement_status = 'completed',
           updated_at = NOW()
         WHERE id = ? 
         AND payment_status = 'completed'
         AND order_status = 'completed'
         AND disbursement_status = 'pending'`,
        [bid_id]
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({
          error: "Bid not found or not eligible for disbursement.",
        });
      }

      // Get bid details for notification
      const [bidDetailsResults] = await connection.query(
        `SELECT 
          b.id AS bid_id,
          b.bid_price,
          b.quotation_type,
          s.email AS supplier_email,
          s.company_name AS supplier_name
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE b.id = ?`,
        [bid_id]
      );

      const bidDetails = bidDetailsResults[0];

      await connection.commit();

      // Send email notification
      await emailService.sendEmail(bidDetails.supplier_email, {
        subject: `Payment Disbursed for ${bidDetails.quotation_type} Bid #${bidDetails.bid_id}`,
        html: `
          <p>Dear ${bidDetails.supplier_name},</p>
          <p>We are pleased to inform you that the payment for your ${
            bidDetails.quotation_type
          } service (Bid #${bidDetails.bid_id}), 
          amounting to $${parseFloat(bidDetails.bid_price).toFixed(2)}, 
          has been successfully disbursed.</p>
          <p>Transaction Reference: ${transaction_reference}</p>
          <p>Please check your account for the transaction.</p>
          <p>Best regards,<br>Your Platform Team</p>
        `,
      });

      // Create in-app notification
      await notificationService.createNotification({
        recipientId: bidDetails.supplier_email,
        recipientType: "supplier",
        title: "Betalning Utbetalad",
        message: `Betalning för ${bidDetails.quotation_type} (Bud #${bidDetails.bid_id}) har utbetalats.`,
        type: "payment",
        referenceId: bid_id,
        referenceType: "bid",
      });

      await logAdminActivity(
        req,
        admin_id,
        "PROCESS_DISBURSEMENT",
        `Processed disbursement for bid #${bid_id} with reference ${transaction_reference}`,
        bid_id,
        "disbursement"
      );

      return res.status(200).json({
        message: "Funds disbursed successfully",
        bid_id,
        service_type: bidDetails.quotation_type,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error in processDisbursement:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to process the disbursement.",
      });
    } finally {
      connection.release();
    }
  },
];

// For completed withdrawal requests
exports.withdrawalRequest = [
  checkRole(["super_admin", "finance_admin"]),
  async (req, res) => {
    const { startDate, endDate, page = 1, limit = 20, search = "" } = req.query;

    try {
      let query = `
        SELECT 
          wr.id AS withdrawal_id,
          CASE 
            WHEN wr.id < 10 THEN CONCAT('WD-000', wr.id)
            WHEN wr.id < 100 THEN CONCAT('WD-00', wr.id)
            WHEN wr.id < 1000 THEN CONCAT('WD-0', wr.id)
            ELSE CONCAT('WD-', wr.id)
          END as withdrawal_reference,
          wr.bid_id,
          wr.amount,
          wr.bank_name,
          wr.iban,
          wr.request_date,
          wr.paid_date,
          wr.status AS withdrawal_status,
          s.company_name,
          s.email AS supplier_email
        FROM withdrawal_requests wr
        JOIN bids b ON wr.bid_id = b.id
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE wr.status = 'completed'
      `;

      const queryParams = [];

      // Add search functionality
      if (search) {
        query += ` AND (
          CASE 
            WHEN wr.id < 10 THEN CONCAT('WD-000', wr.id)
            WHEN wr.id < 100 THEN CONCAT('WD-00', wr.id)
            WHEN wr.id < 1000 THEN CONCAT('WD-0', wr.id)
            ELSE CONCAT('WD-', wr.id)
          END LIKE ? OR
          s.company_name LIKE ?
        )`;
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
      }

      if (startDate) {
        query += " AND wr.paid_date >= ?";
        queryParams.push(startDate);
      }

      if (endDate) {
        query += " AND wr.paid_date <= ?";
        queryParams.push(endDate);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS withdrawal_requests`;
      const [countResults] = await db.promise().query(countQuery, queryParams);
      const totalRecords = countResults[0].total;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " ORDER BY wr.paid_date DESC LIMIT ? OFFSET ?";
      queryParams.push(Number(limit), Number(offset));

      // Get withdrawal requests
      const [withdrawalRequests] = await db.promise().query(query, queryParams);

      // Format the response data
      const formattedWithdrawals = withdrawalRequests.map((wr) => ({
        withdrawal_id: wr.withdrawal_id,
        reference: wr.withdrawal_reference,
        amount: parseFloat(wr.amount).toFixed(2),
        bank_name: wr.bank_name,
        iban: wr.iban,
        request_date: wr.request_date
          ? new Date(wr.request_date).toISOString()
          : null,
        paid_date: wr.paid_date ? new Date(wr.paid_date).toISOString() : null,
        status: wr.withdrawal_status,
        supplier_name: wr.company_name,
        supplier_email: wr.supplier_email,
      }));

      const totalPages = Math.ceil(totalRecords / limit);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_COMPLETED_WITHDRAWALS",
        `Viewed completed withdrawal requests with filters: ${JSON.stringify({
          startDate,
          endDate,
          search,
        })}`,
        null,
        "withdrawals"
      );

      res.status(200).json({
        message: "Completed withdrawal requests retrieved successfully",
        total: totalRecords,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit),
        data: formattedWithdrawals,
      });
    } catch (error) {
      console.error("Error in getCompletedWithdrawalRequests:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to process the request.",
      });
    }
  },
];

// For pending withdrawal requests
exports.pendingWithdrawalRequest = [
  checkRole(["super_admin", "finance_admin"]),
  async (req, res) => {
    const { page = 1, limit = 20, search = "" } = req.query;

    try {
      let query = `
        SELECT 
          wr.id AS withdrawal_id,
          CASE 
            WHEN wr.id < 10 THEN CONCAT('WD-000', wr.id)
            WHEN wr.id < 100 THEN CONCAT('WD-00', wr.id)
            WHEN wr.id < 1000 THEN CONCAT('WD-0', wr.id)
            ELSE CONCAT('WD-', wr.id)
          END as withdrawal_reference,
          wr.bid_id,
          wr.amount,
          wr.bank_name,
          wr.iban,
          wr.request_date,
          wr.status AS withdrawal_status,
          s.company_name,
          s.email AS supplier_email
        FROM withdrawal_requests wr
        JOIN bids b ON wr.bid_id = b.id
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE wr.status = 'pending'
      `;

      const queryParams = [];

      // Add search functionality
      if (search) {
        query += ` AND (
          CASE 
            WHEN wr.id < 10 THEN CONCAT('WD-000', wr.id)
            WHEN wr.id < 100 THEN CONCAT('WD-00', wr.id)
            WHEN wr.id < 1000 THEN CONCAT('WD-0', wr.id)
            ELSE CONCAT('WD-', wr.id)
          END LIKE ? OR
          s.company_name LIKE ?
        )`;
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS withdrawal_requests`;
      const [countResults] = await db.promise().query(countQuery, queryParams);
      const totalRecords = countResults[0].total;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " ORDER BY wr.request_date DESC LIMIT ? OFFSET ?";
      queryParams.push(Number(limit), Number(offset));

      // Get withdrawal requests
      const [withdrawalRequests] = await db.promise().query(query, queryParams);

      // Format the response data
      const formattedWithdrawals = withdrawalRequests.map((wr) => ({
        withdrawal_id: wr.withdrawal_id,
        reference: wr.withdrawal_reference,
        amount: parseFloat(wr.amount).toFixed(2),
        bank_name: wr.bank_name,
        iban: wr.iban,
        request_date: wr.request_date
          ? new Date(wr.request_date).toISOString()
          : null,
        status: wr.withdrawal_status,
        supplier_name: wr.company_name,
        supplier_email: wr.supplier_email,
      }));

      const totalPages = Math.ceil(totalRecords / limit);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_PENDING_WITHDRAWALS",
        `Viewed pending withdrawal requests with search: ${search}`,
        null,
        "withdrawals"
      );

      res.status(200).json({
        message: "Pending withdrawal requests retrieved successfully",
        total: totalRecords,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit),
        data: formattedWithdrawals,
      });
    } catch (error) {
      console.error("Error in getPendingWithdrawalRequests:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to process the request.",
      });
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
          subject: "Begäran om uttag slutförd",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Begäran om uttag slutförd</h2>
              <p>Bästa ${withdrawal.supplier_name},</p>
              <p>Din begäran om uttag har behandlats framgångsrikt.</p>
              <p><strong>Belopp:</strong> $${parseFloat(
                withdrawal.amount
              ).toFixed(2)}</p>
              <p><strong>Transaktionsreferens:</strong> ${
                withdrawal.transaction_reference
              }</p>
              <p><strong>Banknamn:</strong> ${withdrawal.bank_name}</p>
              <p><strong>IBAN:</strong> ${withdrawal.iban}</p>
              <p>Pengarna bör synas på ditt konto inom kort.</p>
              <p>Med vänliga hälsningar,<br>Ditt Plattformsteam</p>
            </div>
          `,
        },
        rejected: {
          subject: "Uppdatering av uttagsbegäran",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Uppdatering av status för uttagsbegäran</h2>
              <p>Bästa ${withdrawal.supplier_name},</p>
              <p>Din begäran om uttag har granskats men kunde inte behandlas vid denna tidpunkt.</p>
              <p><strong>Belopp:</strong> $${parseFloat(
                withdrawal.amount
              ).toFixed(2)}</p>
              <p>Vänligen kontakta vårt supportteam för mer information.</p>
              <p>Med vänliga hälsningar,<br>Ditt Plattformsteam</p>
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
              ? "Uttag slutfört"
              : "Uttagsuppdatering",
          message:
            status === "completed"
              ? `Din begäran om uttag för $${parseFloat(
                  withdrawal.amount
                ).toFixed(2)} has been processed.`
              : `Din begäran om uttag för $${parseFloat(
                  withdrawal.amount
                ).toFixed(2)} har granskats men kunde inte behandlas.`,
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
        messageSv: `Uttagsbegärans status har uppdaterats till ${status} framgångsrikt`,
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
