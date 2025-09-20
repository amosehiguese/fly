const db = require("../../../db/connect");

exports.orderUpdate = async (req, res) => {
  const { orderId, status } = req.body;
  const driverId = req.user.id; // Get driver ID from authenticated user

  if (!orderId || !status) {
    return res.status(400).json({
      success: false,
      message: "Order ID and status are required",
      messageSv: "Order-ID och status krävs",
    });
  }

  try {
    // Step 1: Verify that the driver is assigned to this order
    const assignmentQuery = `
            SELECT ab.order_id, ab.assignedDriverId
            FROM accepted_bids ab
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

    // Step 2: Update the order status
    const updateQuery = `
            UPDATE accepted_bids
            SET delivery_status = ?
            WHERE order_id = ?;
        `;

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [status, orderId], (err, results) => {
        if (err) {
          console.error("Update error:", err);
          return reject(err);
        }
        resolve(results);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      messageSv: "Orderstatus uppdaterad framgångsrikt",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the order status",
      messageSv: "Ett fel inträffade vid uppdatering av orderstatus",
    });
  }
};
