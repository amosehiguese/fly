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
    const supplierId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ 
        error: "Order ID is required",
        errorSv: "Order-ID krävs" 
      });
    }

    try {
      // Get bid details with quotation info
      const baseQuery = `
        SELECT 
          b.supplier_id,
          s.company_name AS supplier_name,
          b.order_id,
          b.quotation_id,
          b.quotation_type,
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
          ab.delivery_status,
          ab.final_price
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN accepted_bids ab ON b.id = ab.bid_id
        WHERE b.order_id = ? AND b.supplier_id = ?
        LIMIT 1;
      `;

      const order = await new Promise((resolve, reject) => {
        db.query(baseQuery, [orderId, supplierId], (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!order) {
        return res.status(404).json({ 
          error: "Order not found or no access permission.",
          errorSv: "Order hittades inte eller ingen åtkomstbehörighet." 
        });
      }

      // Validate and fetch quotation data
      const allowedTypes = [
        'company_relocation', 'move_out_cleaning', 'storage', 'heavy_lifting',
        'carrying_assistance', 'junk_removal', 'estate_clearance', 'evacuation_move',
        'private_move', 'secrecy_move'
      ];

      if (!allowedTypes.includes(order.quotation_type)) {
        return res.status(400).json({ 
          error: "Invalid quotation type",
          errorSv: "Ogiltig offerttyp" 
        });
      }

      // Handle moving_service special case
      let quotationQuery;
      let quotationParams;

      if (['local_move', 'long_distance_move', 'moving_abroad'].includes(order.quotation_type)) {
        quotationQuery = `
          SELECT * FROM moving_service 
          WHERE id = ? AND JSON_CONTAINS(type_of_service, ?, '$')
        `;
        quotationParams = [order.quotation_id, `"${order.quotation_type}"`];
      } else {
        quotationQuery = `SELECT * FROM ${order.quotation_type} WHERE id = ?`;
        quotationParams = [order.quotation_id];
      }

      const quotation = await new Promise((resolve, reject) => {
        db.query(quotationQuery, quotationParams, (err, results) => {
          if (err) {
            console.error("Quotation query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!quotation) {
        return res.status(404).json({ 
          error: "Quotation details not found.",
          errorSv: "Offertdetaljer hittades inte." 
        });
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

      // STEP 3: Format response with enhanced data
      res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        messageSv: "Orderdetaljer hämtades framgångsrikt",
        data: {
          // Order/Bid Information
          supplier_id: order.supplier_id,
          supplier_name: order.supplier_name,
          order_id: order.order_id,
          quotation_id: order.quotation_id,
          customer_id: customer.id,
          quotation_type: order.quotation_type, 
          bid_created_at: order.bid_created_at ? new Date(order.bid_created_at).toISOString() : null,
          bid_approved_date: order.bid_approved_date ? new Date(order.bid_approved_date).toISOString() : null,
          supplier_notes: order.supplier_notes,
          moving_cost: order.moving_cost,
          truck_cost: order.truck_cost,
          additional_services: order.additional_services,
          payment_status: order.payment_status,
          order_status: order.order_status,
          delivery_status: order.delivery_status,
          final_price: order.final_price,
          estimated_pickup_date_from: order.estimated_pickup_date_from ? new Date(order.estimated_pickup_date_from).toISOString() : null,
          estimated_delivery_date_from: order.estimated_delivery_date_from ? new Date(order.estimated_delivery_date_from).toISOString() : null,
          estimated_pickup_date_to: order.estimated_pickup_date_to ? new Date(order.estimated_pickup_date_to).toISOString() : null,
          estimated_delivery_date_to: order.estimated_delivery_date_to ? new Date(order.estimated_delivery_date_to).toISOString() : null,
          
          // Basic Quotation Information 
          pickup_address: quotation.pickup_address,
          delivery_address: quotation.delivery_address,
          distance: quotation.distance,
          date: quotation.date ? new Date(quotation.date).toISOString() : null,
          latest_date: quotation.latest_date ? new Date(quotation.latest_date).toISOString() : null,
          email: quotation.email,
          phone: quotation.phone,
          services: quotation.services,
          
          // COMPUTED FIELDS
          customer_name: quotation.company_name || 
                        (quotation.first_name && quotation.last_name ? 
                         `${quotation.first_name} ${quotation.last_name}` : 
                         quotation.name || 'N/A'),
          total_cost: (parseFloat(order.moving_cost || 0) + 
                      parseFloat(order.truck_cost || 0) + 
                      parseFloat(order.additional_services || 0)).toString(),
          services_parsed: (() => {
            try {
              let parsed = JSON.parse(quotation.services || '[]');
              if (typeof parsed === 'string') parsed = JSON.parse(parsed);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        }
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error: Unable to fetch order details",
        errorSv: "Internt serverfel: Det går inte att hämta orderdetaljer"
      });
    }
  },
];

exports.orderDetailsDetailed = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const { orderId } = req.params;
    const supplierId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ 
        error: "Order ID is required",
        errorSv: "Order-ID krävs" 
      });
    }

    try {
      // Get bid details with order information
      const bidQuery = `
        SELECT 
          b.quotation_id, 
          b.quotation_type,
          b.order_id,
          b.supplier_id,
          s.company_name AS supplier_name,
          b.created_at AS bid_created_at,
          b.approved_at AS bid_approved_date,
          b.supplier_notes,
          b.moving_cost,
          b.truck_cost,
          b.additional_services,
          ab.payment_status,
          ab.order_status,
          ab.delivery_status,
          ab.final_price,
          b.estimated_pickup_date_from,
          b.estimated_delivery_date_from,
          b.estimated_pickup_date_to,
          b.estimated_delivery_date_to
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN accepted_bids ab ON b.id = ab.bid_id
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
        return res.status(403).json({ 
          error: "Access denied. You do not own this bid.",
          errorSv: "Åtkomst nekad. Du äger inte detta bud." 
        });
      }

      // Validate quotation_type
      const allowedTypes = [
        'company_relocation', 'move_out_cleaning', 'storage', 'heavy_lifting',
        'carrying_assistance', 'junk_removal', 'estate_clearance', 'evacuation_move',
        'private_move', 'secrecy_move'
      ];

      if (!allowedTypes.includes(bidDetails.quotation_type)) {
        return res.status(400).json({ 
          error: "Invalid quotation type",
          errorSv: "Ogiltig offerttyp" 
        });
      }

      // Fetch quotation details
      let quotationQuery;
      let quotationParams;

      if (['local_move', 'long_distance_move', 'moving_abroad'].includes(bidDetails.quotation_type)) {
        quotationQuery = `
          SELECT * FROM moving_service 
          WHERE id = ? AND JSON_CONTAINS(type_of_service, ?, '$')
        `;
        quotationParams = [bidDetails.quotation_id, `"${bidDetails.quotation_type}"`];
      } else {
        quotationQuery = `SELECT * FROM ${bidDetails.quotation_type} WHERE id = ?`;
        quotationParams = [bidDetails.quotation_id];
      }

      const quotation = await new Promise((resolve, reject) => {
        db.query(quotationQuery, quotationParams, (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        });
      });

      if (!quotation) {
        return res.status(404).json({ 
          error: "Quotation details not found.",
          errorSv: "Offertdetaljer hittades inte." 
        });
      }

      // Return combined data 
      res.status(200).json({
        success: true,
        message: "Order and quotation details fetched successfully",
        messageSv: "Order- och offertdetaljer hämtades framgångsrikt",
        data: {
          // Order/Bid Data
          order: {
            order_id: bidDetails.order_id,
            supplier_id: bidDetails.supplier_id,
            supplier_name: bidDetails.supplier_name,
            quotation_type: bidDetails.quotation_type,
            bid_created_at: bidDetails.bid_created_at ? new Date(bidDetails.bid_created_at).toISOString() : null,
            bid_approved_date: bidDetails.bid_approved_date ? new Date(bidDetails.bid_approved_date).toISOString() : null,
            supplier_notes: bidDetails.supplier_notes,
            moving_cost: bidDetails.moving_cost,
            truck_cost: bidDetails.truck_cost,
            additional_services: bidDetails.additional_services,
            payment_status: bidDetails.payment_status,
            order_status: bidDetails.order_status,
            delivery_status: bidDetails.delivery_status,
            final_price: bidDetails.final_price,
            estimated_pickup_date_from: bidDetails.estimated_pickup_date_from ? new Date(bidDetails.estimated_pickup_date_from).toISOString() : null,
            estimated_delivery_date_from: bidDetails.estimated_delivery_date_from ? new Date(bidDetails.estimated_delivery_date_from).toISOString() : null,
            estimated_pickup_date_to: bidDetails.estimated_pickup_date_to ? new Date(bidDetails.estimated_pickup_date_to).toISOString() : null,
            estimated_delivery_date_to: bidDetails.estimated_delivery_date_to ? new Date(bidDetails.estimated_delivery_date_to).toISOString() : null,
          },
          
          // Quotation Data
          quotation: {
            ...quotation,
            quotation_type: bidDetails.quotation_type,
            date: quotation.date ? new Date(quotation.date).toISOString() : null,
            latest_date: quotation.latest_date ? new Date(quotation.latest_date).toISOString() : null,
            created_at: quotation.created_at ? new Date(quotation.created_at).toISOString() : null,
            
            // COMPUTED FIELDS
            customer_name: quotation.company_name || 
                          (quotation.first_name && quotation.last_name ? 
                           `${quotation.first_name} ${quotation.last_name}` : 
                           quotation.name || 'N/A'),
            services_parsed: (() => {
              try {
                let parsed = JSON.parse(quotation.services || '[]');
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            })()
          }
        }
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error: Unable to fetch order details",
        errorSv: "Internt serverfel: Det går inte att hämta orderdetaljer"
      });
    }
  },
];

