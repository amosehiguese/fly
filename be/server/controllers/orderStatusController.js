const db = require("../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../utils/notificationService");
const {
  authenticateJWT,
  userIsLoggedIn,
  supplierIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");
const invoiceService = require("../../utils/invoiceService");
const fs = require("fs").promises;

exports.moverOrderUpdate = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    console.log("supplier_id", supplier_id);
    const { order_id, status } = req.body;

    if (!order_id || !status) {
      return res.status(400).json({
        error: "Order ID and status are required",
      });
    }

    if (!order_id.includes("-")) {
      return res.status(400).json({
        error: "Invalid order ID format",
      });
    }

    const [quotationType, quotationId, bidId] = order_id.split("-");

    // Valid status values
    const validStatuses = ["accepted", "ongoing", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status value",
      });
    }

    try {
      // First verify bid ownership
      const ownershipQuery = `
          SELECT b.id, b.order_status, 
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_number
          FROM accepted_bids b
          WHERE b.order_id = ? 
          AND b.supplier_id = ?
         
        `;

      const [bid] = await new Promise((resolve, reject) => {
        db.query(ownershipQuery, [order_id, supplier_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!bid) {
        return res.status(403).json({
          error: "Unauthorized: This order does not belong to you",
        });
      }

      // Update bid status
      const updateQuery = `
          UPDATE accepted_bids 
          SET 
            order_status = ?,
            updated_at = NOW()
          WHERE order_id = ? 
          AND supplier_id = ?
         
        `;

      await new Promise((resolve, reject) => {
        db.query(
          updateQuery,
          [status, order_id, supplier_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      return res.status(200).json({
        message: "Order status updated successfully",
        data: {
          order_id: bid.order_number,
          status,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to update order status",
      });
    }
  },
];

exports.customerOrderUpdate = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const { order_id, order_pin, status } = req.body;
    const customer_email = req.user.email;

    try {
      // Input validation
      if (!order_id || !order_pin || !status) {
        return res.status(400).json({
          error: "Order ID, PIN and status are required",
        });
      }

      if (!["completed", "failed", "accepted"].includes(status)) {
        return res.status(400).json({
          error: "Invalid status. Allowed values: completed, failed, accepted",
        });
      }

      if (!order_id.includes("-")) {
        return res.status(400).json({
          error: "Invalid order ID format",
        });
      }

      const [quotationType, quotationId, bidId] = order_id.split("-");

      // First get customer PIN
      const [customer] = await new Promise((resolve, reject) => {
        const query = `
          SELECT order_pin
          FROM customers 
          WHERE email = ?
        `;
        db.query(query, [customer_email], (err, results) => {
          if (err) {
            console.error("PIN query error:", err);
            reject(err);
          }
          resolve(results);
        });
      });

      if (!customer) {
        return res.status(403).json({
          error: "Customer not found",
        });
      }

      // Verify PIN before checking order
      const pinMatches = await bcrypt.compare(order_pin, customer.order_pin);
      // console.log("PIN verification result:", pinMatches);

      if (!pinMatches) {
        return res.status(403).json({
          error: "Invalid order PIN",
        });
      }

      // Check order ownership and get supplier_id
      const [order] = await new Promise((resolve, reject) => {
        const query = `
          SELECT b.id, b.supplier_id, s.email as supplier_email
          FROM bids b
          JOIN ${quotationType} q ON q.id = b.quotation_id
          JOIN suppliers s ON s.id = b.supplier_id
          WHERE q.email_address = ?
          AND b.id = ?
          AND b.quotation_type = ?
          AND b.quotation_id = ?
        `;
        db.query(
          query,
          [customer_email, bidId, quotationType, quotationId],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!order) {
        return res.status(403).json({
          error: "Order not found or you don't have permission to update it",
        });
      }

      // Update order status
      const result = await new Promise((resolve, reject) => {
        const query = `
          UPDATE bids 
          SET 
            order_status = ?,
            updated_at = NOW()
          WHERE id = ? 
          AND quotation_type = ?
          AND quotation_id = ?
        `;
        db.query(
          query,
          [status, bidId, quotationType, quotationId],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Order not found or not updated",
        });
      }

      // Send notification to supplier
      await notificationService.createNotification({
        recipientId: order.supplier_email,
        recipientType: "supplier",
        title: "Orderstatus uppdaterad",
        message: `Order ${order_id} har markerats som ${status} av kunden.`,
        type: "order_update",
        referenceId: bidId,
        referenceType: "order",
      });

      // If order is marked as completed, generate final invoice
      if (status === "completed") {
        const [orderDetails] = await db.query(
          `SELECT * FROM accepted_bids WHERE order_id = ?`,
          [order_id]
        );

        if (orderDetails.length > 0) {
          const order = orderDetails[0];

          // Generate final invoice
          const invoiceData = {
            order_id,
            customer_name: order.customer_name, // Ensure this data is available
            customer_email: order.customer_email,
            service_description: `${order.quotation_type} Service - Final Payment`,
            amount: order.remaining_payment,
            is_initial_payment: false,
          };

          const invoicePath = await invoiceService.generateInvoice(invoiceData);

          // Send email with final invoice
          await emailService.sendEmail(order.customer_email, {
            subject: `Final Invoice - ${order_id}`,
            html: `
              <p>Thank you for using our service!</p>
              <p>Please find attached the final invoice for your order.</p>
              <p>Amount: ${order.remaining_payment.toFixed(2)} SEK</p>
            `,
            attachments: [
              {
                filename: `final-invoice-${order_id}.pdf`,
                path: invoicePath,
              },
            ],
          });

          // Clean up the temporary file
          await fs.unlink(invoicePath);
        }
      }

      return res.status(200).json({
        message: "Order status updated successfully",
        data: {
          order_id,
          status,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to update order status",
      });
    }
  },
];
