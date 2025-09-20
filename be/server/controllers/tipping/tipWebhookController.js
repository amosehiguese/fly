const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../../../db/connect");
const emailService = require("../../../utils/emailService");

const handleTipWebhook = async (req, res) => {
    console.log("🔍 Tip Webhook received");
    console.log("🔍 Content-Type:", req.headers["content-type"]);
    console.log(
        "🔍 Stripe-Signature:",
        req.headers["stripe-signature"] ? "Present" : "Missing"
    );

    const sig = req.headers["stripe-signature"];
    let event;

    try {
        const webhookSecret =
            process.env.NODE_ENV === "production"
                ? process.env.STRIPE_WEBHOOK_SECRET_LIVE
                : process.env.STRIPE_WEBHOOK_SECRET;

        console.log(
            "🔍 Using webhook secret for environment:",
            process.env.NODE_ENV
        );

        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log("✅ Tip Webhook signature verified successfully");
        console.log("✅ Event type:", event.type);
    } catch (err) {
        console.error("❌ Tip Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        const paymentIntent = event.data.object;
        const { order_id, customer_email, driver_id } = paymentIntent.metadata;
        console.log("✅ Tip payment metadata:", paymentIntent.metadata);

        // Handle different payment events
        switch (event.type) {
            case "payment_intent.succeeded":
                console.log("🔍 Handling tip payment success");
                await handleTipPaymentSuccess(order_id, paymentIntent.amount / 100, customer_email, driver_id);
                console.log("✅ Tip payment success handling complete");
                break;
            case "payment_intent.payment_failed":
                console.log("🔍 Handling tip payment failure");
                await handleTipPaymentFailure(order_id);
                console.log("✅ Tip payment failure handling complete");
                break;
            default:
                console.log(`⚠️ Unhandled tip event type ${event.type}`);
        }

        console.log("✅ Tip webhook processing complete, sending response");
        res.json({ received: true });
    } catch (error) {
        console.error("❌ Error processing tip webhook:", error);
        res.status(500).json({
            error: "Tip webhook processing failed",
            details: error.message,
        });
    }
};

const handleTipPaymentSuccess = async (orderId, amount, customerEmail, driverId) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        // Check if tip is already paid
        const [existingTip] = await connection.query(
            `SELECT tip_status FROM checkout 
             WHERE order_id = ? AND tip_status = 'paid'`,
            [orderId]
        );

        if (existingTip.length > 0) {
            console.log("⚠️ Tip already paid for order:", orderId);
            await connection.rollback();
            return;
        }

        // Update tip status in checkout table
        await connection.query(
            `UPDATE checkout 
             SET tip_status = 'paid', tip_date = NOW()
             WHERE order_id = ?`,
            [orderId]
        );

        // Get driver details for email notification
        const [driverDetails] = await connection.query(
            `SELECT d.email, d.full_name, c.customer_name
             FROM drivers d
             JOIN accepted_bids ab ON d.id = ab.assignedDriverId
             JOIN checkout c ON ab.order_id = c.order_id
             WHERE c.order_id = ? AND d.id = ?`,
            [orderId, driverId]
        );

        if (driverDetails.length > 0) {
            const driver = driverDetails[0];
            
            // Send email to driver
            await emailService.sendEmail(driver.email, {
                subject: `Ny dricks mottagen! 🎉`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Du har fått en ny dricks! 💰</h2>
                        <p>Kära ${driver.full_name},</p>
                        <p>Du har fått en dricks på ${amount} SEK från ${driver.customer_name}.</p>
                        <p>Detta är ett tecken på att du gjorde ett utmärkt jobb!</p>
                        <p>Fortsätt med det fantastiska arbetet!</p>
                    </div>
                `
            });
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const handleTipPaymentFailure = async (orderId) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        // Check if tip is already paid before marking as failed
        const [existingTip] = await connection.query(
            `SELECT tip_status FROM checkout 
             WHERE order_id = ? AND tip_status = 'paid'`,
            [orderId]
        );

        if (existingTip.length > 0) {
            console.log("⚠️ Tip already paid for order:", orderId);
            await connection.rollback();
            return;
        }

        // Update tip status to failed
        await connection.query(
            `UPDATE checkout 
             SET tip_status = 'failed'
             WHERE order_id = ?`,
            [orderId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    handleTipWebhook
}; 