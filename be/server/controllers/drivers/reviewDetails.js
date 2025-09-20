const db = require("../../../db/connect");
const { check, validationResult } = require("express-validator");

const {
  authenticateJWT,
  driverIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");

exports.driversDetailsById = [
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const driverId = req.params.driverId; 

    if (!driverId || isNaN(driverId)) {
      return res.status(400).json({
        error: "Invalid driver ID format.",
        errorSv: "Ogiltigt förar-ID-format.",
      });
    }

    try {
      // Fetch supplier details
      const [[driver]] = await db.promise().query(
        `SELECT 
          id, full_name, phone_number, email, license_image, 
          vehicle_type, created_at
         FROM drivers WHERE id = ?`,
        [driverId]
      );

      if (!driver) {
        return res.status(404).json({
          error: "No driver found with the provided ID.",
          errorSv: "Ingen förare hittades med det angivna ID:t.",
        });
      }

      driver.created_at = driver.created_at
        ? new Date(driver.created_at).toISOString()
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
        [driverId, driverId, driverId, driverId, driverId]
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
         JOIN accepted_bids ab ON d.bid_id = ab.id 
         WHERE ab.assignedDriverId = ?`,
        [driverId]
      );

      // Fetch supplier's rating statistics
      const [[ratings]] = await db.promise().query(
        `SELECT 
          COUNT(*) AS total_reviews,
          AVG(rating) AS average_rating
         FROM reviews
         WHERE driver_id = ?`,
        [driverId]
      );

      const driverRatings = {
        total_reviews: ratings.total_reviews || 0,
        average_rating: ratings.average_rating
          ? parseFloat(ratings.average_rating).toFixed(1)
          : "0.0",
      };

      return res.status(200).json({
        message: "Drivers details retrieved successfully",
        messageSv: "Förares detaljer hämtades framgångsrikt",
        driver,
        orders,
        totalOrders,
        completedOrders,
        pendingOrders,
        acceptedOrders,
        ratings: driverRatings,
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

exports.getAllSupplierDrivers = async (req, res) => {
  const supplierId = req.user.id;

  try {
    // Fetch all drivers under the supplier
    const [drivers] = await db.promise().query(
      `SELECT 
        d.id, 
        d.full_name, 
        d.phone_number, 
        d.email, 
        d.vehicle_type,  
        d.created_at,
        (
          SELECT COUNT(*) 
          FROM accepted_bids ab 
          WHERE ab.assignedDriverId = d.id
        ) as total_assignments,
        (
          SELECT COUNT(*) 
          FROM accepted_bids ab 
          WHERE ab.assignedDriverId = d.id 
          AND ab.order_status = 'completed'
        ) as completed_orders,
        (
          SELECT COUNT(*) 
          FROM accepted_bids ab 
          WHERE ab.assignedDriverId = d.id 
          AND ab.order_status = 'accepted'
        ) as pending_orders,
        (
          SELECT COUNT(*) 
          FROM disputes disp
          JOIN accepted_bids ab ON disp.bid_id = ab.id
          WHERE ab.assignedDriverId = d.id
        ) as total_disputes,
        (
          SELECT COUNT(*) 
          FROM reviews 
          WHERE driver_id = d.id
        ) as total_reviews,
        (
          SELECT AVG(rating) 
          FROM reviews 
          WHERE driver_id = d.id
        ) as average_rating
      FROM drivers d
      WHERE d.supplier_id = ?
      ORDER BY d.created_at DESC`,
      [supplierId]
    );

    if (!drivers.length) {
      return res.status(404).json({
        success: false,
        message: "No drivers found under your company",
        messageSv: "Inga förare hittades under ditt företag"
      });
    }

    // Process the results
    const processedDrivers = drivers.map(driver => ({
      ...driver,
      created_at: driver.created_at ? new Date(driver.created_at).toISOString() : null,
      average_rating: driver.average_rating ? parseFloat(driver.average_rating).toFixed(1) : "0.0",
      statistics: {
        total_assignments: driver.total_assignments || 0,
        completed_orders: driver.completed_orders || 0,
        pending_orders: driver.pending_orders || 0,
        total_disputes: driver.total_disputes || 0,
        ratings: {
          total_reviews: driver.total_reviews || 0,
          average_rating: driver.average_rating ? parseFloat(driver.average_rating).toFixed(1) : "0.0"
        }
      }
    }));

    return res.status(200).json({
      success: true,
      message: "Drivers details retrieved successfully",
      messageSv: "Förardetaljer hämtades framgångsrikt",
      data: {
        total_drivers: drivers.length,
        drivers: processedDrivers
      }
    });

  } catch (error) {
    console.error("Error in getAllSupplierDrivers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: Unable to fetch drivers details",
      messageSv: "Internt serverfel: Det går inte att hämta förardetaljer",
      error: error.message
    });
  }
};
