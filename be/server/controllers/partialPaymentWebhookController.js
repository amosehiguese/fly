const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../../db/connect");
const emailService = require("../../utils/emailService");
const { getIO } = require("../../socket");

const handlePartialPaymentWebhook = async (req, res) => {
  console.log("🔍 Partial Payment Webhook received");
  console.log("🔍 Content-Type:", req.headers["content-type"]);
  console.log(
    "🔍 Stripe-Signature:",
    req.headers["stripe-signature"] ? "Present" : "Missing"
  );
  console.log("🔍 Body type:", typeof req.body);
  console.log("🔍 Body is Buffer:", Buffer.isBuffer(req.body));
  console.log("🔍 Body length:", req.body.length);

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
    console.log("✅ Webhook signature verified successfully");
    console.log("✅ Event type:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const { bid_id, payment_type } = event.data.object.metadata;
    console.log("✅ Webhook metadata:", event.data.object.metadata);

    // Get RUT info and bid details
    const [bidInfo] = await db.promise().query(
      `
            SELECT 
                b.id,
                b.total_price,
                b.quotation_type,
                CASE b.quotation_type
                    WHEN 'move_out_cleaning' THEN mc.has_rut
                    WHEN 'storage' THEN st.has_rut
                    WHEN 'heavy_lifting' THEN hl.has_rut
                    WHEN 'carrying_assistance' THEN ca.has_rut
                    WHEN 'junk_removal' THEN jr.has_rut
                    WHEN 'estate_clearance' THEN ec.has_rut
                    WHEN 'evacuation_move' THEN em.has_rut
                    WHEN 'privacy_move' THEN pm.has_rut
                    WHEN 'local_move' THEN ms.has_rut
                    WHEN 'long_distance_move' THEN ms.has_rut
                    WHEN 'moving_abroad' THEN ms.has_rut
                    ELSE false
                END AS has_rut
            FROM bids b
            LEFT JOIN moving_service ms ON b.quotation_id = ms.id 
            LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id 
            LEFT JOIN storage st ON b.quotation_id = st.id 
            LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id 
            LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id 
            LEFT JOIN junk_removal jr ON b.quotation_id = jr.id 
            LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id 
            LEFT JOIN evacuation_move em ON b.quotation_id = em.id 
            LEFT JOIN privacy_move pm ON b.quotation_id = pm.id 
            WHERE b.id = ?
        `,
      [bid_id]
    );

    const bid = bidInfo[0];

    if (!bid) {
      throw new Error("Bid not found");
    }

    // Apply RUT discount if eligible
    let finalAmount = bid.total_price;
    if (bid.has_rut && bid.quotation_type !== "company_relocation") {
      finalAmount = bid.total_price * 0.5; // 50% RUT deduction

      // Update the payment intent amount
      const paymentIntent = event.data.object;
      if (payment_type === "initial") {
        paymentIntent.amount = Math.round(finalAmount * 0.2 * 100); // 20% of discounted amount
      } else if (payment_type === "remaining") {
        paymentIntent.amount = Math.round(finalAmount * 0.8 * 100); // 80% of discounted amount
      }

      // Update Stripe payment intent
      await stripe.paymentIntents.update(paymentIntent.id, {
        amount: paymentIntent.amount,
        metadata: {
          ...paymentIntent.metadata,
          original_amount: bid.total_price,
          rut_deduction: bid.total_price - finalAmount,
        },
      });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePartialPaymentSuccess({
          ...event.data.object,
          metadata: {
            ...event.data.object.metadata,
            has_rut: bid.has_rut,
            final_amount: finalAmount,
            quotation_type: bid.quotation_type,
          },
        });
        break;

      case "payment_intent.payment_failed":
        await handlePartialPaymentFailure(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({
      received: true,
      has_rut: bid.has_rut,
      original_amount: bid.total_price,
      final_amount: finalAmount,
      quotation_type: bid.quotation_type,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      details: error.message,
    });
  }
};

const handlePartialPaymentSuccess = async (paymentIntent) => {
  const { bid_id, payment_type } = paymentIntent.metadata;
  const connection = await db.promise();

  try {
    await connection.beginTransaction();

    const [bids] = await connection.query(
      `
            SELECT 
                b.*, bp.*,
                s.email AS supplier_email,
                s.company_name AS supplier_name,
                CASE b.quotation_type
                    WHEN 'company_relocation' THEN cr.email_address
                    WHEN 'move_out_cleaning' THEN mc.email_address
                    WHEN 'storage' THEN st.email_address
                    WHEN 'heavy_lifting' THEN hl.email_address
                    WHEN 'carrying_assistance' THEN ca.email_address
                    WHEN 'junk_removal' THEN jr.email_address
                    WHEN 'estate_clearance' THEN ec.email_address
                    WHEN 'evacuation_move' THEN em.email_address
                    WHEN 'privacy_move' THEN pm.email_address
                    WHEN 'local_move' THEN ms.email_address
                    WHEN 'long_distance_move' THEN ms.email_address
                    WHEN 'moving_abroad' THEN ms.email_address
                END AS customer_email
            FROM bids b
            JOIN bid_payments bp ON b.id = bp.bid_id
            JOIN suppliers s ON b.supplier_id = s.id
            LEFT JOIN company_relocation cr ON b.quotation_id = cr.id 
            LEFT JOIN moving_service ms ON b.quotation_id = ms.id 
                AND b.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad')
            LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id 
                AND b.quotation_type = 'move_out_cleaning'
            LEFT JOIN storage st ON b.quotation_id = st.id 
                AND b.quotation_type = 'storage'
            LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id 
                AND b.quotation_type = 'heavy_lifting'
            LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id 
                AND b.quotation_type = 'carrying_assistance'
            LEFT JOIN junk_removal jr ON b.quotation_id = jr.id 
                AND b.quotation_type = 'junk_removal'
            LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id 
                AND b.quotation_type = 'estate_clearance'
            LEFT JOIN evacuation_move em ON b.quotation_id = em.id 
                AND b.quotation_type = 'evacuation_move'
            LEFT JOIN privacy_move pm ON b.quotation_id = pm.id 
                AND b.quotation_type = 'privacy_move'
            WHERE b.id = ?
        `,
      [bid_id]
    );

    const bid = bids[0];
    if (!bid) throw new Error(`Bid ${bid_id} not found`);

    if (payment_type === "initial") {
      await connection.query(
        `
                UPDATE bid_payments 
                SET 
                    initial_payment_status = 'paid',
                    initial_payment_date = NOW()
                WHERE bid_id = ?
            `,
        [bid_id]
      );

      await connection.query(
        `
                UPDATE bids 
                SET 
                    payment_status = 'initial_payment_completed',
                    updated_at = NOW()
                WHERE id = ?
            `,
        [bid_id]
      );

      await emailService.sendEmail(bid.supplier_email, {
        subject: `Initial Payment Received for ${bid.quotation_type}`,
        html: `
                    <p>Dear ${bid.supplier_name},</p>
                    <p>The customer has completed the initial 20% payment of ${bid.initial_amount} SEK.</p>
                    <p>You can now proceed with the service.</p>
                    <p>The remaining payment of ${bid.remaining_amount} SEK will be required upon completion.</p>
                `,
      });
    } else if (payment_type === "remaining") {
      await connection.query(
        `
                UPDATE bid_payments 
                SET 
                    remaining_payment_status = 'paid',
                    remaining_payment_date = NOW()
                WHERE bid_id = ?
            `,
        [bid_id]
      );

      await connection.query(
        `
                UPDATE bids 
                SET 
                    payment_status = 'paid',
                    order_status = 'completed',
                    completion_date = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            `,
        [bid_id]
      );

      await emailService.sendEmail(bid.supplier_email, {
        subject: `Final Payment Received for ${bid.quotation_type}`,
        html: `
                    <p>Dear ${bid.supplier_name},</p>
                    <p>The customer has completed the final payment of ${bid.remaining_amount} SEK.</p>
                    <p>The order is now marked as completed.</p>
                `,
      });
    }

    await connection.commit();

    const io = getIO();
    io.emit("payment_update", {
      bid_id,
      payment_type,
      status: "success",
      message: `${
        payment_type === "initial" ? "Initial" : "Remaining"
      } payment successful`,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

const handlePartialPaymentFailure = async (paymentIntent) => {
  const { bid_id, payment_type } = paymentIntent.metadata;

  const updateQuery = `
    UPDATE bids 
    SET 
      payment_status = ?,
      requires_payment_method = true,
      updated_at = NOW()
    WHERE id = ?
  `;

  const status =
    payment_type === "initial"
      ? "awaiting_initial_payment"
      : "awaiting_remaining_payment";

  await db.promise().query(updateQuery, [status, bid_id]);
};

module.exports = handlePartialPaymentWebhook;
