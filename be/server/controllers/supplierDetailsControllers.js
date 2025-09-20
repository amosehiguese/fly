const db = require("../../db/connect");
const { check, validationResult } = require("express-validator");
const { checkRole } = require("../controllers/loginController/authMiddleware");

const logAdminActivity = async (
  req,
  adminId,
  action,
  message,
  referenceId = null,
  referenceType = null
) => {
  try {
    const query = `
      INSERT INTO admin_logs (admin_id, admin_username, admin_fullname, role, action, message, reference_id, reference_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      adminId,
      req.admin.username,
      req.admin.fullname,
      req.admin.role,
      action,
      message,
      referenceId,
      referenceType,
    ];
    await db.query(query, values);
  } catch (error) {
    console.error("Error logging admin activity:", error);
  }
};

exports.supplierDetails = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  (req, res) => {
    const { company_name, reg_status, start_date, end_date } = req.query;

    let query = `
      SELECT 
        s.id,
        s.company_name,
        s.email,
        s.phone,
        s.address,
        s.city,
        s.postal_code,
        s.organization_number,
        s.contact_person,
        s.reg_status,
        s.created_at,
        COALESCE(AVG(r.rating), 0) AS total_rating,
        COALESCE(COUNT(DISTINCT ab.id), 0) AS accepted_orders
      FROM suppliers s
      LEFT JOIN reviews r ON s.id = r.supplier_id
      LEFT JOIN accepted_bids ab ON s.id = ab.supplier_id
      WHERE 1=1
    `;

    const queryParams = [];

    // Apply filters dynamically
    if (company_name) {
      query += ` AND s.company_name LIKE ?`;
      queryParams.push(`%${company_name}%`);
    }

    if (reg_status) {
      query += ` AND s.reg_status = ?`;
      queryParams.push(reg_status);
    }

    if (start_date && end_date) {
      query += ` AND DATE(s.created_at) BETWEEN ? AND ?`;
      queryParams.push(start_date, end_date);
    } else if (start_date) {
      query += ` AND DATE(s.created_at) >= ?`;
      queryParams.push(start_date);
    } else if (end_date) {
      query += ` AND DATE(s.created_at) <= ?`;
      queryParams.push(end_date);
    }

    query += ` 
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;

    db.query(query, queryParams, async (error, results) => {
      if (error) {
        console.error("Error in supplierDetails:", error);
        return res.status(500).json({
          error: "Internal Server Error: Unable to process the request.",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "No suppliers found in the system with the given filters.",
          messageSv:
            "Inga leverantörer hittades i systemet med de angivna filtren.",
        });
      }

      // Format dates for each supplier
      const formattedSuppliers = results.map((supplier) => ({
        ...supplier,
        created_at: supplier.created_at
          ? new Date(supplier.created_at).toISOString()
          : null,
      }));

      // Calculate counts of active and pending suppliers
      const activeCount = results.filter(
        (s) => s.reg_status === "active"
      ).length;
      const pendingCount = results.filter(
        (s) => s.reg_status === "pending"
      ).length;

      // Get total count of all suppliers (ignoring filters)
      db.query(
        `SELECT COUNT(*) AS total_suppliers FROM suppliers`,
        async (err, totalResult) => {
          if (err) {
            console.error("Error fetching total suppliers count:", err);
            return res.status(500).json({
              error:
                "Internal Server Error: Unable to retrieve total supplier count.",
            });
          }

          const totalSuppliers = totalResult[0].total_suppliers;

          await logAdminActivity(
            req,
            req.admin.id,
            "VIEWED_SUPPLIER_DETAILS",
            `Viewed supplier details with filters: ${JSON.stringify({
              company_name,
              reg_status,
              start_date,
              end_date,
            })}`,
            null,
            "supplier details"
          );

          return res.status(200).json({
            message: "Supplier details retrieved successfully",
            count: results.length,
            activeCount,
            pendingCount,
            totalSuppliers,
            suppliers: formattedSuppliers,
          });
        }
      );
    });
  },
];

exports.supplierDetailsById = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  [check("id").isInt().withMessage("Invalid supplier ID format")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplierId = req.params.id;

    try {
      // Fetch supplier details
      const [[supplier]] = await db.promise().query(
        `SELECT 
          id, company_name, email, phone, address, city, postal_code, 
          organization_number, contact_person, reg_status, created_at, 
          bank, account_number, iban
         FROM suppliers WHERE id = ?`,
        [supplierId]
      );

      if (!supplier) {
        return res
          .status(404)
          .json({ error: "No supplier found with the provided ID.", errorSv: "Ingen leverantör hittades med det angivna ID:t." });
      }

      supplier.created_at = supplier.created_at
        ? new Date(supplier.created_at).toISOString()
        : null;

      // Fetch supplier's orders
      const [orders] = await db.promise().query(
        `SELECT 
          b.order_id,
          b.quotation_id,
          b.quotation_type,
          q.pickup_address,
          q.delivery_address,
          q.date,
          b.moving_cost AS total_price,
          ab.payment_status,
          ab.order_status,
          q.created_at AS order_date,
          (SELECT COUNT(*) FROM bids WHERE supplier_id = ?) AS total_orders,
          (SELECT COUNT(*) FROM bids WHERE supplier_id = ? AND order_status = 'completed') AS completed_orders,
          (SELECT COUNT(*) FROM bids WHERE supplier_id = ? AND order_status = 'pending') AS pending_orders,
          (SELECT COUNT(*) FROM accepted_bids WHERE supplier_id = ?) AS accepted_orders
         FROM bids b
         INNER JOIN accepted_bids ab ON b.id = ab.bid_id
         INNER JOIN (
            SELECT id, 'private_move' AS type, pickup_address, delivery_address, date, created_at FROM private_move
            UNION ALL SELECT id, 'moving_cleaning', pickup_address, delivery_address, date, created_at FROM moving_cleaning
            UNION ALL SELECT id, 'heavy_lifting', pickup_address, delivery_address, date, created_at FROM heavy_lifting
            UNION ALL SELECT id, 'company_relocation', pickup_address, delivery_address, date, created_at FROM company_relocation
            UNION ALL SELECT id, 'estate_clearance', pickup_address, delivery_address, date, created_at FROM estate_clearance
            UNION ALL SELECT id, 'evacuation_move', pickup_address, delivery_address, date, created_at FROM evacuation_move
            UNION ALL SELECT id, 'secrecy_move', pickup_address, delivery_address, date, created_at FROM secrecy_move
         ) q ON b.quotation_id = q.id AND b.quotation_type = q.type
         WHERE b.supplier_id = ?
         ORDER BY q.created_at DESC`,
        [supplierId, supplierId, supplierId, supplierId, supplierId]
      );

      const totalOrders = orders.length > 0 ? orders[0].total_orders : 0;
      const completedOrders =
        orders.length > 0 ? orders[0].completed_orders : 0;
      const pendingOrders = orders.length > 0 ? orders[0].pending_orders : 0;
      const acceptedOrders = orders.length > 0 ? orders[0].accepted_orders : 0;

      // Count total disputes related to this supplier
      const [[{ totalDisputes }]] = await db.promise().query(
        `SELECT COUNT(*) AS totalDisputes 
         FROM disputes d 
         JOIN bids b ON d.bid_id = b.id 
         WHERE b.supplier_id = ?`,
        [supplierId]
      );

      // Fetch supplier's rating statistics
      const [[ratings]] = await db.promise().query(
        `SELECT 
          COUNT(*) AS total_reviews,
          AVG(rating) AS average_rating
         FROM reviews
         WHERE supplier_id = ?`,
        [supplierId]
      );

      const supplierRatings = {
        total_reviews: ratings.total_reviews || 0,
        average_rating: ratings.average_rating
          ? parseFloat(ratings.average_rating).toFixed(1)
          : "0.0",
      };

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_SUPPLIER_DETAILS",
        `Viewed details for supplier ${supplier.company_name} (ID: ${supplierId}) including orders and ratings`,
        supplierId,
        "supplier"
      );

      return res.status(200).json({
        message: "Supplier details retrieved successfully",
        supplier,
        orders,
        totalOrders,
        completedOrders,
        pendingOrders,
        acceptedOrders,
        ratings: supplierRatings,
        totalDisputes,
      });
    } catch (error) {
      console.error("Error in supplierDetailsById:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to process the request.",
      });
    }
  },
];
