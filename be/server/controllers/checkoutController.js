const db = require("../../db/connect");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

exports.checkout = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const { order_id } = req.params;
    const customer_email = req.user.email;

    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    const connection = await db.promise().getConnection();

    try {
      await connection.beginTransaction();

      const [orderDetails] = await connection.query(
        `SELECT 
            q.name, q.ssn, q.pickup_address AS from_address, 
            q.delivery_address, q.phone, q.email, q.rut_discount, q.extra_insurance, 
            ab.final_price, ab.payment_status,
            b.moving_cost, b.additional_services,
            ab.moving_price_percentage, ab.additional_service_percentage, ab.truck_cost
          FROM accepted_bids ab
          JOIN bids b ON ab.bid_id = b.id
          JOIN (
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, rut_discount, extra_insurance, 'private_move' AS table_name FROM private_move
            UNION ALL
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, rut_discount, extra_insurance, 'moving_cleaning' AS table_name FROM moving_cleaning
            UNION ALL
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, rut_discount, extra_insurance, 'heavy_lifting' AS table_name FROM heavy_lifting
            UNION ALL
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, NULL AS rut_discount, NULL AS extra_insurance, 'company_relocation' AS table_name FROM company_relocation
            UNION ALL
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, rut_discount, extra_insurance, 'estate_clearance' AS table_name FROM estate_clearance
            UNION ALL
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, rut_discount, extra_insurance, 'evacuation_move' AS table_name FROM evacuation_move
            UNION ALL
            SELECT id, name, ssn, email, pickup_address, delivery_address, phone, rut_discount, extra_insurance, 'secrecy_move' AS table_name FROM secrecy_move
          ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
          WHERE b.order_id = ? AND q.email = ?
          LIMIT 1;`,
        [order_id, customer_email]
      );

      if (orderDetails.length === 0) {
        throw { status: 404, message: "Order not found or access denied." };
      }

      const order = orderDetails[0];

      // Normalize RUT discount as boolean
      const rutDiscountApplied = order.rut_discount === 1;

      // Final full price
      const fullPrice = Math.round(order.final_price);

      // Calculate RUT deduction (if applicable)
      const rutDeduction = rutDiscountApplied ? Math.round(fullPrice * 0.5) : 0;

      // Adjusted price after discount
      const adjustedTotalPrice = fullPrice - rutDeduction;

      const pricePercentage =
        order.payment_status.trim().toLowerCase() === "awaiting_initial_payment"
          ? 0.2
          : 0.8;

      const amountToPay = Math.round(adjustedTotalPrice * pricePercentage);
      const remainingBalance = adjustedTotalPrice - amountToPay;

      await connection.query(
        `INSERT INTO checkout (order_id, customer_id, customer_name, from_address, delivery_address, phone, 
          total_price, amount_paid, remaining_balance, rut_discount_applied, rut_deduction, payment_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          ON DUPLICATE KEY UPDATE amount_paid = ?, remaining_balance = ?, updated_at = NOW();`,
        [
          order_id,
          req.user.id,
          order.name,
          order.from_address,
          order.delivery_address,
          order.phone,
          adjustedTotalPrice, // ✅ This price includes RUT discount if applied
          amountToPay,
          remainingBalance,
          rutDiscountApplied,
          rutDeduction,
          amountToPay,
          remainingBalance,
        ]
      );

      await connection.commit();
      connection.release();

      return res.status(200).json({
        order_id,
        customer_name: order.name,
        from_address: order.from_address,
        delivery_address: order.delivery_address,
        phone: order.phone,
        total_price: adjustedTotalPrice,
        rut_discount_applied: rutDiscountApplied,
        rut_deduction: rutDeduction,
        amount_to_pay: amountToPay,
        remaining_balance: remainingBalance,
        payment_status: "pending",
        moving_cost:
          order.moving_price_percentage === 0
            ? order.moving_cost
            : Number(order.moving_price_percentage * 0.01 * order.moving_cost) +
              Number(order.moving_cost),
        additional_services:
          order.additional_service_percentage === 0
            ? order.additional_services
            : Number(
                order.additional_service_percentage *
                  0.01 *
                  order.additional_services
              ) + Number(order.additional_services),
        truck_cost: order.truck_cost,
        extra_insurance: order.extra_insurance,
        insurance_cost: 249,
        ssn: order.ssn,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error in checkout:", error);
      return res.status(error.status || 500).json({
        error: error.message || "Internal Server Error",
      });
    }
  },
];


exports.getCheckout = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    const connection = await db.promise().getConnection();

    try {
      const [checkoutDetails] = await connection.query(
        `SELECT * FROM checkout WHERE order_id = ?`,
        [order_id]
      );

      if (checkoutDetails.length === 0) {
        return res.status(404).json({ error: "Checkout not found. Customer hasnt checked out yet" });
      }

      const checkout = checkoutDetails[0];

      return res.status(200).json({
        order_id: checkout.order_id,
        customer_name: checkout.customer_name,
        from_address: checkout.from_address,
        delivery_address: checkout.delivery_address,
        phone: checkout.phone,
        total_price: checkout.total_price,
        amount_paid: checkout.amount_paid,
        remaining_balance: checkout.remaining_balance,
        rut_discount_applied: checkout.rut_discount_applied,
        rut_deduction: checkout.rut_deduction,
        payment_status: checkout.payment_status,
      });
    } catch (error) {
      console.error("Error in getCheckout:", error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    } finally {
      connection.release();
    }
  },
];