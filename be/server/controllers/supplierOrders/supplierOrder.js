const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../../utils/notificationService");
const {
  authenticateJWT,
  supplierIsLoggedIn,
} = require("../../controllers/loginController/authMiddleware");

exports.getSupplierOrders = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplierId = req.user.id;
    const { order_status, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      // Step 1: Get the quotation types for the supplier’s approved bids
      const typeQuery = `
          SELECT DISTINCT b.quotation_type
          FROM bids b
          JOIN accepted_bids ab ON b.id = ab.bid_id
          WHERE b.supplier_id = ? AND ab.customer_rejected = FALSE
        `;

      const quotationTypes = await new Promise((resolve, reject) => {
        db.query(typeQuery, [supplierId], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      // if (quotationTypes.length === 0) {
      //   return res.status(404).json({ message: "No approved orders found." });
      // }

      let allOrders = [];

      for (const row of quotationTypes) {
        const quotationTable = row.quotation_type;

        // Step 2: Fetch orders based on supplier's approved bids, including order_status
        const ordersQuery = `
            SELECT 
              b.order_id,
              q.pickup_address,
              q.delivery_address,
              q.distance,
              ab.order_status
            FROM bids b
            JOIN accepted_bids ab ON b.id = ab.bid_id
            JOIN ${quotationTable} q ON b.quotation_id = q.id
            WHERE b.supplier_id = ? 
            AND ab.customer_rejected = FALSE
            ${order_status ? "AND ab.order_status = ?" : ""}
            LIMIT ? OFFSET ?
          `;

        const queryParams = [supplierId];
        if (order_status) queryParams.push(order_status);
        queryParams.push(limit, offset);

        const orders = await new Promise((resolve, reject) => {
          db.query(ordersQuery, queryParams, (err, results) => {
            if (err) reject(err);
            resolve(results);
          });
        });

        allOrders = allOrders.concat(orders);
      }

      res.status(200).json({
        orders: allOrders,
        currentPage: parseInt(page),
        perPage: limit,
      });
    } catch (error) {
      console.error("Error fetching supplier orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.getSupplierDisputes = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplierId = req.user.id;
    const { status, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      // Step 1: Fetch disputes related to the supplier via the bids table
      const disputeQuery = `
          SELECT 
            d.id AS dispute_id,
            b.order_id,
            d.reason,
            d.status AS dispute_status,
            dr.resolution_outcome,
            dr.admin_comment,
            dr.refunded_amount,
            dr.status AS resolution_status
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id
          LEFT JOIN dispute_resolutions dr ON d.id = dr.dispute_id
          WHERE b.supplier_id = ?
          ${status ? "AND d.status = ?" : ""}
          LIMIT ? OFFSET ?
        `;

      const queryParams = [supplierId];
      if (status) queryParams.push(status);
      queryParams.push(limit, offset);

      const disputes = await new Promise((resolve, reject) => {
        db.query(disputeQuery, queryParams, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (disputes.length === 0) {
        return res.status(404).json({ message: "No disputes found." });
      }

      res.status(200).json({
        disputes,
        currentPage: parseInt(page),
        perPage: limit,
      });
    } catch (error) {
      console.error("Error fetching supplier disputes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.orderDetails = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const { orderId } = req.params;
    const userEmail = req.user.email;
    const userType = req.user.role; // Assuming 'customer' or 'supplier'

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      // Fetch order details
      const baseQuery = `
        SELECT 
          b.supplier_id,
          s.company_name AS supplier_name,
          b.order_id,
          b.created_at AS bid_created_at,
          b.approved_at AS bid_approved_date,
          b.supplier_notes,
          b.estimated_pickup_date_to,
          b.estimated_delivery_date_to,
          b.estimated_pickup_date_from,
          b.estimated_delivery_date_from,
          b.moving_cost,
          b.truck_cost,
          b.additional_services,
          ab.payment_status,
          ab.order_status,
          ab.delivery_status
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN accepted_bids ab ON b.id = ab.bid_id
        WHERE b.order_id = ?
        LIMIT 1;
      `;

      const order = await new Promise((resolve, reject) => {
        db.query(baseQuery, [orderId], (err, results) => {
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

      // Fetch quotation details
      const quotationQuery = `
        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'private_move' AS table_name 
        FROM private_move 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'private_move' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        UNION ALL

        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'moving_cleaning' AS table_name 
        FROM moving_cleaning 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'moving_cleaning' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        UNION ALL

        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'heavy_lifting' AS table_name 
        FROM heavy_lifting 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'heavy_lifting' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        UNION ALL

        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'company_relocation' AS table_name 
        FROM company_relocation 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'company_relocation' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        UNION ALL

        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'estate_clearance' AS table_name 
        FROM estate_clearance 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'estate_clearance' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        UNION ALL

        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'evacuation_move' AS table_name 
        FROM evacuation_move 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'evacuation_move' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        UNION ALL

        SELECT 
          id, service_type, pickup_address, distance, delivery_address, date, latest_date, 
          name, ssn, email, phone, services, status, 
          'secrecy_move' AS table_name 
        FROM secrecy_move 
        WHERE id = (SELECT quotation_id FROM bids WHERE order_id = 'BID-20250304-939') 
          AND 'secrecy_move' = (SELECT quotation_type FROM bids WHERE order_id = 'BID-20250304-939')

        LIMIT 1;

      `;

      const queryParams = Array(14).fill(orderId); // Fill placeholders for all queries

      const quotation = await new Promise((resolve, reject) => {
        db.query(quotationQuery, queryParams, (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!quotation) {
        return res.status(404).json({ error: "Quotation details not found." });
      }

      // Fetch customer ID using email from the quotation
      const customerQuery = `SELECT id FROM customers WHERE email = ? LIMIT 1`;

      const customer = await new Promise((resolve, reject) => {
        db.query(customerQuery, [quotation.email], (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : { id: null });
        });
      });

      res.status(200).json({
        message: "Order details fetched successfully",
        messageSv: "Order detaljer hämtades framgångsrikt",
        data: {
          ...order,
          ...quotation, // Merge quotation details
          customer_id: customer.id, // Add customer ID
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

exports.orderDetailsDetailed = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const { orderId } = req.params;
    const supplierId = req.user.id; // Get supplier ID from authenticated user

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      // Step 1: Verify that the supplier owns the bid
      const bidQuery = `
          SELECT b.quotation_id, b.quotation_type
          FROM bids b
          WHERE b.order_id = ? AND b.supplier_id = ?
          LIMIT 1;
        `;

      const bidDetails = await new Promise((resolve, reject) => {
        db.query(bidQuery, [orderId, supplierId], (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!bidDetails) {
        return res
          .status(403)
          .json({ error: "Access denied. You do not own this bid." });
      }

      const { quotation_id, quotation_type } = bidDetails;

      // Step 2: Fetch full quotation details from the correct table
      const quotationQuery = `
          SELECT *
          FROM ${quotation_type}
          WHERE id = ?;
        `;

      const quotation = await new Promise((resolve, reject) => {
        db.query(quotationQuery, [quotation_id], (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!quotation) {
        return res.status(404).json({ error: "Quotation details not found." });
      }

      res.status(200).json({
        message: "Order and quotation details fetched successfully",
        messageSv: "Order och offert detaljer hämtades framgångsrikt",
        data: {
          quotation,
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
