const db = require('../../../db/connect');
const { connect } = require('./tippingRoutes');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add tip to an order
exports.addTip = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { orderId } = req.params;
        const { amount, message } = req.body;
        const customerId = req.user.id;


        // First verify if order exists and belongs to customer
        const [orderCheck] = await connection.query(
            `SELECT DISTINCT c.order_id, c.customer_id 
             FROM checkout c 
             WHERE c.order_id = ? AND c.customer_id = ?`,
            [orderId, customerId]
        );



        if (orderCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or unauthorized",
                messageSv: "Beställningen hittades inte eller obehörig"
            });
        }

        // Check if tip already exists and is paid
        const [existingTip] = await connection.query(
            `SELECT tip_status FROM checkout 
             WHERE order_id = ? AND tip_status = 'paid'`,
            [orderId]
        );

        if (existingTip.length > 0) {
            return res.status(400).json({
                success: false,
                message: "A tip has already been paid for this order",
                messageSv: "En dricks har redan betalats för denna beställning"
            });
        }

        // Get order and driver details with LEFT JOIN to handle cases where driver might not be assigned yet
        const [orderDetails] = await connection.query(
            `SELECT DISTINCT 
                c.*,
                ab.assignedDriverId,
                d.email as driver_email,
                d.full_name as driver_name
             FROM checkout c
             LEFT JOIN accepted_bids ab ON c.order_id = ab.order_id
             LEFT JOIN drivers d ON ab.assignedDriverId = d.id
             WHERE c.order_id = ?`,
            [orderId]
        );

        if (orderDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order details not found",
                messageSv: "Beställningsdetaljer hittades inte"
            });
        }

        const order = orderDetails[0];

        // Verify that a driver is assigned
        if (!order.assignedDriverId) {
            return res.status(400).json({
                success: false,
                message: "No driver assigned to this order yet",
                messageSv: "Ingen förare har tilldelats denna beställning än"
            });
        }

        // Create Stripe payment intent for tip
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: 'sek',
            metadata: {
                order_id: orderId,
                payment_type: 'tip',
                customer_email: req.user.email,
                driver_id: order.assignedDriverId
            }
        });

        // Store tip information in checkout table
        await connection.query(
            `UPDATE checkout 
             SET tip_amount = ?, tip_message = ?, tip_status = 'pending'
             WHERE order_id = ?`,
            [amount, message, orderId]
        );

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            message: "Tip payment initiated",
            messageSv: "Dricksbetalning påbörjad"
        });

    } catch (error) {
        console.error('Error in addTip:', error);
        res.status(500).json({
            success: false,
            message: "Error processing tip",
            messageSv: "Fel vid behandling av dricks",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get tip history for a driver
exports.getDriverTips = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const driverId = req.user.id;

        const [tips] = await connection.query(
            `SELECT DISTINCT
                c.order_id,
                c.tip_amount,
                c.tip_message,
                c.tip_status,
                c.tip_date,
                cu.fullname,
                cu.email
             FROM checkout c
             JOIN customers cu ON c.customer_id = cu.id
             JOIN accepted_bids ab ON c.order_id = ab.order_id
             WHERE ab.assignedDriverId = ? AND c.tip_amount > 0
             ORDER BY c.tip_date DESC`,
            [driverId]
        );

        res.status(200).json({
            success: true,
            data: tips
        });

    } catch (error) {
        console.error('Error in getDriverTips:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching tips",
            messageSv: "Fel vid hämtning av dricks",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get tips for all drivers belonging to a supplier
exports.getSupplierDriverTips = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const supplierId = req.user.id;

        const [tips] = await connection.query(
            `SELECT DISTINCT
                c.order_id,
                c.tip_amount,
                c.tip_message,
                c.tip_status,
                c.tip_date,
                cu.fullname as customer_name,
                cu.email as customer_email,
                d.full_name as driver_name,
                d.email as driver_email
             FROM checkout c
             JOIN customers cu ON c.customer_id = cu.id
             JOIN accepted_bids ab ON c.order_id = ab.order_id
             JOIN drivers d ON ab.assignedDriverId = d.id
             WHERE d.supplier_id = ? 
             AND c.tip_amount > 0
             ORDER BY c.tip_date DESC`,
            [supplierId]
        );

        // Group tips by driver
        const tipsByDriver = tips.reduce((acc, tip) => {
            const driverId = tip.driver_email;
            if (!acc[driverId]) {
                acc[driverId] = {
                    driver_name: tip.driver_name,
                    driver_email: tip.driver_email,
                    total_tips: 0,
                    tips: []
                };
            }
            acc[driverId].tips.push({
                order_id: tip.order_id,
                amount: tip.tip_amount,
                message: tip.tip_message,
                status: tip.tip_status,
                date: tip.tip_date,
                customer_name: tip.customer_name,
                customer_email: tip.customer_email
            });
            acc[driverId].total_tips += tip.tip_amount;
            return acc;
        }, {});

        // Calculate total tips for all drivers
        const totalTips = Object.values(tipsByDriver).reduce((sum, driver) => sum + driver.total_tips, 0);

        res.status(200).json({
            success: true,
            data: {
                total_tips: totalTips,
                drivers: Object.values(tipsByDriver)
            }
        });

    } catch (error) {
        console.error('Error in getSupplierDriverTips:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching driver tips",
            messageSv: "Fel vid hämtning av förares dricks",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Admin: Get all tips with payout status
exports.getAdminTips = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const [tips] = await connection.query(
            `SELECT DISTINCT
                c.order_id,
                c.tip_amount,
                c.tip_message,
                c.tip_status,
                c.tip_date,
                c.tip_payout_status,
                c.tip_payout_date,
                cu.fullname as customer_name,
                cu.email as customer_email,
                d.full_name as driver_name,
                d.email as driver_email,
                s.company_name as supplier_name,
                s.email as supplier_email,
                s.phone as supplier_phone,
                s.address as supplier_address,
                s.account_number as accountNumber,
                s.iban as IBAN,
                s.swift_code as swiftCode,
                s.bank as bankName
             FROM checkout c
             JOIN customers cu ON c.customer_id = cu.id
             JOIN accepted_bids ab ON c.order_id = ab.order_id
             JOIN drivers d ON ab.assignedDriverId = d.id
             JOIN suppliers s ON d.supplier_id = s.id
             WHERE c.tip_amount > 0
             ORDER BY c.tip_date DESC`
        );

        // Group tips by driver
        const tipsByDriver = tips.reduce((acc, tip) => {
            const driverId = tip.driver_email;
            if (!acc[driverId]) {
                acc[driverId] = {
                    driver_name: tip.driver_name,
                    driver_email: tip.driver_email,
                    supplier: {
                        name: tip.supplier_name,
                        email: tip.supplier_email,
                        phone: tip.supplier_phone,
                        address: tip.supplier_address,
                        accountNumber: tip.accountNumber,
                        IBAN: tip.IBAN,
                        swiftCode: tip.swiftCode,
                        bankName: tip.bankName
                    },
                    total_tips: 0,
                    total_paid: 0,
                    total_pending: 0,
                    tips: []
                };
            }
            acc[driverId].tips.push({
                order_id: tip.order_id,
                amount: tip.tip_amount,
                message: tip.tip_message,
                status: tip.tip_status,
                date: tip.tip_date,
                payout_status: tip.tip_payout_status,
                payout_date: tip.tip_payout_date,
                customer_name: tip.customer_name,
                customer_email: tip.customer_email
            });
            acc[driverId].total_tips += tip.tip_amount;
            if (tip.tip_payout_status === 'paid') {
                acc[driverId].total_paid += tip.tip_amount;
            } else {
                acc[driverId].total_pending += tip.tip_amount;
            }
            return acc;
        }, {});

        // Calculate totals
        const totals = Object.values(tipsByDriver).reduce((acc, driver) => {
            acc.total_tips += driver.total_tips;
            acc.total_paid += driver.total_paid;
            acc.total_pending += driver.total_pending;
            return acc;
        }, { total_tips: 0, total_paid: 0, total_pending: 0 });

        res.status(200).json({
            success: true,
            data: {
                totals,
                drivers: Object.values(tipsByDriver)
            }
        });

    } catch (error) {
        console.error('Error in getAdminTips:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching tips",
            messageSv: "Fel vid hämtning av dricks",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Admin: Mark tips as paid out
exports.markTipsAsPaid = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { driverEmail, orderIds } = req.body;

        if (!driverEmail || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid request parameters",
                messageSv: "Ogiltiga parametrar"
            });
        }

        await connection.beginTransaction();

        // Update tip payout status
        await connection.query(
            `UPDATE checkout c
             JOIN accepted_bids ab ON c.order_id = ab.order_id
             JOIN drivers d ON ab.assignedDriverId = d.id
             SET c.tip_payout_status = 'paid',
                 c.tip_payout_date = NOW()
             WHERE d.email = ? 
             AND c.order_id IN (?)`,
            [driverEmail, orderIds]
        );

        // Get updated tip information
        const [updatedTips] = await connection.query(
            `SELECT 
                c.order_id,
                c.tip_amount,
                c.tip_payout_status,
                c.tip_payout_date
             FROM checkout c
             JOIN accepted_bids ab ON c.order_id = ab.order_id
             JOIN drivers d ON ab.assignedDriverId = d.id
             WHERE d.email = ? 
             AND c.order_id IN (?)`,
            [driverEmail, orderIds]
        );



        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Tips marked as paid successfully",
            messageSv: "Dricks markerade som betalda",
            data: updatedTips
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error in markTipsAsPaid:', error);
        res.status(500).json({
            success: false,
            message: "Error updating tip status",
            messageSv: "Fel vid uppdatering av dricksstatus",
            error: error.message
        });
    } finally {
        connection.release();
    }
}; 