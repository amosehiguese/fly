const db = require("../../../db/connect");

exports.orderDetailsDetailed = async (req, res) => {
  const { orderId } = req.params;
  const driverId = req.user.id; // Get driver ID from authenticated user

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required",
      messageSv: "Order-ID krävs",
    });
  }

  try {
    // Step 1: Verify that the driver is assigned to this order
    const assignmentQuery = `
        SELECT ab.delivery_status, ab.order_id, ab.supplier_id, b.quotation_id, b.quotation_type
        FROM accepted_bids ab
        JOIN bids b ON b.order_id = ab.order_id
        WHERE ab.order_id = ? AND ab.assignedDriverId = ?
        LIMIT 1;
      `;

    const assignmentDetails = await new Promise((resolve, reject) => {
      db.query(assignmentQuery, [orderId, driverId], (err, results) => {
        if (err) {
          console.error("Query error:", err);
          return reject(err);
        }
        resolve(results.length ? results[0] : null);
      });
    });

    if (!assignmentDetails) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This order is not assigned to you.",
        messageSv: "Åtkomst nekad. Detta uppdrag är inte tilldelat dig.",
      });
    }

    const { quotation_id, quotation_type } = assignmentDetails;

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
      return res.status(404).json({
        success: false,
        message: "Quotation details not found.",
        messageSv: "Offertdetaljer hittades inte.",
      });
    }

    // Step 3: Get supplier details for the order
    const supplierQuery = `
        SELECT fullname, company_name, phone, email
        FROM suppliers
        WHERE id = ?;
      `;

    const supplierDetails = await new Promise((resolve, reject) => {
      db.query(
        supplierQuery,
        [assignmentDetails.supplier_id],
        (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results.length ? results[0] : null);
        }
      );
    });

    res.status(200).json({
      success: true,
      message: "Order and quotation details fetched successfully",
      messageSv: "Order- och offertdetaljer hämtades framgångsrikt",
      data: {
        quotation,
        supplier: supplierDetails,
        orderStatus: {
          orderId: assignmentDetails.order_id,
          deliveryStatus: assignmentDetails.delivery_status,
          quotationType: quotation_type,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: Unable to fetch order details",
      messageSv: "Internt serverfel: Det går inte att hämta orderdetaljer",
      error: error.message,
    });
  }
};

exports.getDriverOrders = async (req, res) => {
  const driverId = req.user.id;
  const { order_status, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    // Step 1: Get the quotation types for the driver's assigned orders
    const typeQuery = `
      SELECT DISTINCT b.quotation_type
      FROM bids b
      JOIN accepted_bids ab ON b.order_id = ab.order_id
      WHERE ab.assignedDriverId = ?
    `;

    const quotationTypes = await new Promise((resolve, reject) => {
      db.query(typeQuery, [driverId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    let allOrders = [];

    for (const row of quotationTypes) {
      const quotationTable = row.quotation_type;

      // Step 2: Fetch orders assigned to the driver with pagination
      const ordersQuery = `
        SELECT 
          ab.order_id,
          q.*,
          ab.order_status,
          s.company_name as supplier_name,
          s.phone as supplier_phone,
          s.email as supplier_email
        FROM accepted_bids ab
        JOIN bids b ON b.order_id = ab.order_id
        JOIN ${quotationTable} q ON b.quotation_id = q.id
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE ab.assignedDriverId = ?
        ${order_status ? "AND ab.order_status = ?" : ""}
        ORDER BY ab.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [driverId];
      if (order_status) queryParams.push(order_status);
      queryParams.push(limit, offset);

      const orders = await new Promise((resolve, reject) => {
        db.query(ordersQuery, queryParams, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      // Add quotation type to each order for frontend reference
      const ordersWithType = orders.map(order => ({
        ...order,
        quotation_type: quotationTable
      }));

      allOrders = allOrders.concat(ordersWithType);
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT ab.order_id) as total
      FROM accepted_bids ab
      WHERE ab.assignedDriverId = ?
      ${order_status ? "AND ab.order_status = ?" : ""}
    `;

    const countParams = [driverId];
    if (order_status) countParams.push(order_status);

    const totalCount = await new Promise((resolve, reject) => {
      db.query(countQuery, countParams, (err, results) => {
        if (err) reject(err);
        resolve(results[0].total);
      });
    });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      messageSv: "Ordrar hämtades framgångsrikt",
      data: {
        orders: allOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          perPage: limit,
          totalOrders: totalCount,
          hasNextPage: offset + limit < totalCount,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching driver orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: Unable to fetch orders",
      messageSv: "Internt serverfel: Det går inte att hämta ordrar",
      error: error.message
    });
  }
};