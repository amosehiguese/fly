const db = require("../../db/connect");
const path = require("path");
const notificationService = require("../../utils/notificationService");

const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

const ITEMS_PER_PAGE = 20;

exports.getAllDisputes = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    const {
      page = 1,
      status,
      quotationType,
      startDate,
      endDate,
      search = "",
    } = req.query;

    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const queryParams = [];

      let baseQuery = `
        SELECT 
          d.id AS dispute_id,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          d.reason,
          d.request_details,
          d.status,
          d.created_at,
          b.quotation_type,
          b.total_price AS transaction_amount,
          s.company_name AS supplier_name,
          c.fullname AS submitted_by,
          d.images
        FROM disputes d
        JOIN bids b ON d.bid_id = b.id
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN customers c ON d.submitted_by = c.id
        WHERE 1=1
      `;

      if (search) {
        baseQuery += ` AND (
          d.id LIKE ? OR
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) LIKE ? OR
          d.reason LIKE ? OR
          d.request_details LIKE ? OR
          s.company_name LIKE ? OR
          c.fullname LIKE ?
        )`;
        const searchParam = `%${search}%`;
        queryParams.push(
          searchParam,
          searchParam,
          searchParam,
          searchParam,
          searchParam,
          searchParam
        );
      }

      if (status) {
        baseQuery += ` AND d.status = ?`;
        queryParams.push(status);
      }

      if (quotationType) {
        baseQuery += ` AND b.quotation_type = ?`;
        queryParams.push(quotationType);
      }

      if (startDate) {
        baseQuery += ` AND d.created_at >= ?`;
        queryParams.push(startDate);
      }

      if (endDate) {
        baseQuery += ` AND d.created_at <= ?`;
        queryParams.push(endDate);
      }

      queryParams.push(ITEMS_PER_PAGE, offset);

      // Get disputes with pagination
      const [disputes] = await db
        .promise()
        .query(
          baseQuery + ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
          queryParams
        );

      const processedDisputes = disputes.map((dispute) => ({
        ...dispute,
        images: JSON.parse(dispute.images || "[]"),
      }));

      // Get total count
      const countQuery = baseQuery.replace(
        `SELECT 
          d.id AS dispute_id,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          d.reason,
          d.request_details,
          d.status,
          d.created_at,
          b.quotation_type,
          b.total_price AS transaction_amount,
          s.company_name AS supplier_name,
          c.fullname AS submitted_by,
          d.images`,
        "SELECT COUNT(*) AS total"
      );

      const [totalResults] = await db
        .promise()
        .query(countQuery, queryParams.slice(0, -2));
      const totalDisputes = totalResults[0].total;

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_DISPUTES",
        `Viewed disputes list with filters: ${JSON.stringify({
          status,
          quotationType,
          startDate,
          endDate,
          search,
        })}`,
        null,
        "disputes"
      );

      res.json({
        message: "Disputes fetched successfully.",
        totalDisputes,
        totalPages: Math.ceil(totalDisputes / ITEMS_PER_PAGE),
        currentPage: Number(page),
        data: processedDisputes,
      });
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.getDisputeDetails = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [results] = await db.promise().query(
        `SELECT 
          d.id AS dispute_id,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          d.reason,
          d.request_details,
          d.status,
          d.created_at,
          b.quotation_type,
          b.moving_cost + b.truck_cost + b.additional_services AS transaction_amount,
          s.company_name AS supplier_name,
          c.fullname AS submitted_by,
          d.images
        FROM disputes d
        JOIN bids b ON d.bid_id = b.id
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN customers c ON d.submitted_by = c.id
        WHERE d.id = ?`,
        [id]
      );

      const dispute = results[0];

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }

      dispute.images = JSON.parse(dispute.images || "[]");

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_DISPUTE_DETAILS",
        `Viewed details for dispute #${id}`,
        id,
        "dispute"
      );

      res.json({
        message: "Dispute details fetched successfully.",
        data: dispute,
      });
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.updateDisputeStatus = [
  checkRole(["super_admin", "support_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "resolved", "under_review"].includes(status)) {
        return res.status(400).json({
          error:
            "Invalid status. Allowed values: pending, resolved, under_review.",
        });
      }

      // Get dispute details
      const [disputeResults] = await db.promise().query(
        `SELECT 
          d.id AS dispute_id,
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          b.quotation_type,
          b.moving_cost + b.truck_cost + b.additional_services AS transaction_amount,
          c.email AS customer_email,
          s.email AS supplier_email
        FROM disputes d
        JOIN bids b ON d.bid_id = b.id
        JOIN customers c ON d.submitted_by = c.id
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE d.id = ?`,
        [id]
      );

      const dispute = disputeResults[0];

      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found." });
      }

      // Update dispute status
      const [result] = await db.promise().query(
        `UPDATE disputes 
         SET status = ? 
         WHERE id = ?`,
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Dispute not found or not updated." });
      }

      // Send notifications
      const notifications = [];

      notifications.push(
        notificationService.createNotification({
          recipientId: dispute.customer_email,
          recipientType: "customer",
          title: "Tviststatus Uppdaterad",
          message: `Statusen för din tvist för beställning ${dispute.order_id} har uppdaterats till '${status}'.'.`,
          type: "dispute",
          referenceId: id,
          referenceType: "dispute",
        })
      );

      notifications.push(
        notificationService.createNotification({
          recipientId: dispute.supplier_email,
          recipientType: "supplier",
          title: "Tviststatus Uppdaterad",
          message: `Tvisten för beställning ${dispute.order_id} har uppdaterats till '${status}'.`,
          type: "dispute",
          referenceId: id,
          referenceType: "dispute",
        })
      );

      await Promise.all(notifications);

      await logAdminActivity(
        req,
        req.admin.id,
        "UPDATE_DISPUTE_STATUS",
        `Updated status of dispute #${id} to ${status}`,
        id,
        "dispute"
      );

      res.json({
        message: "Dispute status updated successfully.",
        order_id: dispute.order_id,
      });
    } catch (error) {
      console.error("Error updating dispute status:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];
