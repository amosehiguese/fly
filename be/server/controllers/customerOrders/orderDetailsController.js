const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const emailService = require("../../utils/emailService");
const notificationService = require("../../../utils/notificationService");
const {
  authenticateJWT,
  userIsLoggedIn,
} = require("../../controllers/loginController/authMiddleware");

exports.orderDetails = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const { orderId } = req.params;
    const userEmail = req.user.email;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      const query = `
          SELECT 
            -- Quotation details
            q.service_type,
            q.pickup_address,
            q.delivery_address,
            q.date,
            q.latest_date,
            q.name,
            q.ssn,
            q.email,
            q.phone,
            q.services,
            q.distance,
            q.status AS quotation_status,
  
            -- Bid details
            b.supplier_id,
            s.company_name AS supplier_name,
            s.id as supplier_id,
            b.order_id,
            b.id AS bid_id,
            b.created_at AS bid_created_at,
            b.approved_at AS bid_approved_date,
            b.supplier_notes,
            b.estimated_pickup_date_to,
            b.estimated_delivery_date_to,
            b.estimated_pickup_date_from,
            b.estimated_delivery_date_from,
             
            -- Accepted bid details
            ab.final_price,
            ab.payment_status,
            ab.order_status,
            ab.delivery_status
          FROM bids b
          JOIN suppliers s ON b.supplier_id = s.id
          JOIN accepted_bids ab ON b.id = ab.bid_id
          JOIN (
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'private_move' AS table_name FROM private_move
            UNION ALL
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'moving_cleaning' AS table_name FROM moving_cleaning
            UNION ALL
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'heavy_lifting' AS table_name FROM heavy_lifting
            UNION ALL
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'company_relocation' AS table_name FROM company_relocation
            UNION ALL
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'estate_clearance' AS table_name FROM estate_clearance
            UNION ALL
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'evacuation_move' AS table_name FROM evacuation_move
            UNION ALL
            SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                   name, ssn, email, phone, services, distance, status, 'secrecy_move' AS table_name FROM secrecy_move
          ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
          WHERE b.order_id = ? AND q.email = ? 
          LIMIT 1;
        `;

      const params = [orderId, userEmail];

      const order = await new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!order) {
        return res
          .status(404)
          .json({ error: "Order not found or no access permission." });
      }

      res.status(200).json({
        message: "Order details fetched successfully",
        data: {
          ...order,
          bid_created_at: order.bid_created_at
            ? new Date(order.bid_created_at).toISOString()
            : null,
          bid_approved_date: order.bid_approved_date
            ? new Date(order.bid_approved_date).toISOString()
            : null,
            estimated_pickup_date_from: order.estimated_pickup_date_from
            ? new Date(order.estimated_pickup_date_from).toISOString()
            : null,
          estimated_delivery_date_from: order.estimated_delivery_date_from
            ? new Date(order.estimated_delivery_date_from).toISOString()
            : null,
          estimated_pickup_date_to: order.estimated_pickup_date_to
            ? new Date(order.estimated_pickup_date_to).toISOString()
            : null,
          estimated_delivery_date_to: order.estimated_delivery_date_to
            ? new Date(order.estimated_delivery_date_to).toISOString()
            : null,
        },
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch order details",
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

    if (!order_id || !order_pin || !status) {
      return res
        .status(400)
        .json({ error: "Order ID, PIN, and status are required" });
    }

    if (!["completed", "failed", "accepted"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed values: completed, failed, accepted",
      });
    }

    const connection = await db.promise().getConnection();

    try {
      await connection.beginTransaction();

      // Get and verify customer's order PIN
      const [customer] = await connection.query(
        `SELECT order_pin FROM customers WHERE email = ?`,
        [customer_email]
      );

      if (!customer.length) {
        throw { status: 403, message: "Customer not found" };
      }

      // ✅ Check if order_pin is NULL or not set
      if (!customer[0].order_pin) {
        throw {
          status: 403,
          message: "Please set an order PIN before proceeding.",
          messageSv: "Vänligen ställ in en beställnings-PIN innan du fortsätter.",
        };
      }

      const pinMatches = await bcrypt.compare(order_pin, customer[0].order_pin);
      if (!pinMatches) {
        throw { status: 403, message: "Invalid order PIN" };
      }

      // Fetch order details using the order_id from the bids table
      const [order] = await connection.query(
        `SELECT 
              b.id AS bid_id, b.order_id, b.supplier_id, s.email AS supplier_email,
              q.service_type, q.pickup_address, q.delivery_address, q.date, q.latest_date,
              q.name, q.ssn, q.email, q.phone, q.services, q.status AS quotation_status,
              b.created_at AS bid_created_at, b.approved_at AS bid_approved_date, 
              b.supplier_notes, b.estimated_completion_date,
              ab.final_price, ab.payment_status, ab.order_status, ab.delivery_status
            FROM bids b
            JOIN suppliers s ON b.supplier_id = s.id
            JOIN accepted_bids ab ON b.id = ab.bid_id
            JOIN (
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'private_move' AS table_name FROM private_move
              UNION ALL
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'moving_cleaning' AS table_name FROM moving_cleaning
              UNION ALL
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'heavy_lifting' AS table_name FROM heavy_lifting
              UNION ALL
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'company_relocation' AS table_name FROM company_relocation
              UNION ALL
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'estate_clearance' AS table_name FROM estate_clearance
              UNION ALL
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'evacuation_move' AS table_name FROM evacuation_move
              UNION ALL
              SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                    name, ssn, email, phone, services, status, 'secrecy_move' AS table_name FROM secrecy_move
            ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
            WHERE b.order_id = ? AND q.email = ?
            LIMIT 1;`,
        [order_id, customer_email]
      );

      if (!order.length) {
        throw {
          status: 403,
          message: "Order not found or you don't have permission to update it",
        };
      }

      const bidId = order[0].bid_id;

      // Update the order status in accepted_bids
      const [updateResult] = await connection.query(
        `UPDATE accepted_bids 
             SET order_status = ?, updated_at = NOW()
             WHERE bid_id = ?`,
        [status, bidId]
      );

      if (updateResult.affectedRows === 0) {
        throw { status: 404, message: "Order not found or not updated" };
      }

      // Send notification to supplier
      await notificationService.createNotification({
        recipientId: order[0].supplier_email,
        recipientType: "supplier",
        title: "Beställningsstatus uppdaterad",
        message: `Beställning ${order_id} har markerats som ${status} av kunden.`,
        type: "order_update",
        referenceId: bidId,
        referenceType: "order",
      });

      await connection.commit();
      connection.release();

      return res.status(200).json({
        message: "Order status updated successfully",
        data: {
          order_id,
          status,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error updating order status:", error);
      return res.status(error.status || 500).json({
        error:
          error.message ||
          "Internal Server Error: Unable to update order status",
      });
    }
  },
];

exports.quotationDetails = [
  authenticateJWT,
  userIsLoggedIn,
  (req, res) => {
    const { quotation_id, quotation_type } = req.params;
    const userEmail = req.user.email; // Get the logged-in user's email

    if (!quotation_id || !quotation_type) {
      return res.status(400).json({ error: "Quotation ID and type are required" });
    }

    let tableName;

    // Define table names based on the 7 quotation services
    switch (quotation_type.toLowerCase()) {
      case "private_move":
        tableName = "private_move";
        break;
      case "secrecy_move":
        tableName = "secrecy_move";
        break;
      case "evacuation_move":
        tableName = "evacuation_move";
        break;
      case "estate_clearance":
        tableName = "estate_clearance";
        break;
      case "heavy_lifting":
        tableName = "heavy_lifting";
        break;
      case "company_relocation":
        tableName = "company_relocation";
        break;
      case "moving_cleaning":
        tableName = "moving_cleaning";
        break;
      default:
        return res.status(400).json({ error: "Invalid quotation type" });
    }

    // Query to fetch the quotation and verify ownership
    const sql = `SELECT * FROM ?? WHERE id = ? AND email = ?`;
    db.query(sql, [tableName, quotation_id, userEmail], (error, results) => {
      if (error) {
        console.error("Error fetching quotation details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(403).json({ error: "Unauthorized access or quotation not found" });
      }

      res.status(200).json({ success: true, data: results[0] });
    });
  },
];


