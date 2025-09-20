const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../../db/connect");
const emailService = require("../../utils/emailService");

const paymentSheet = async (req, res) => {
  try {
    const { bid_id, customer_email } = req.body;

    if (!bid_id || !customer_email) {
      return res.status(400).json({
        error: "Bid ID and customer email are required.",
      });
    }

    // Update the getBidQuery to use accepted_bids
    const getBidQuery = `
      SELECT 
        b.id AS bid_id,
        b.quotation_type,
        b.quotation_id,
        s.company_name AS supplier_name, 
        s.email AS supplier_email,
        ab.payment_status,
        ab.final_price AS total_price,
        ab.initial_payment AS initial_payment,
        ab.remaining_payment AS remaining_payment,
        ab.order_id AS order_id,
        CASE b.quotation_type
          WHEN 'company_relocation' THEN cr.email
          WHEN 'moving_cleaning' THEN mc.email
          WHEN 'heavy_lifting' THEN hl.email
          WHEN 'estate_clearance' THEN ec.email
          WHEN 'evacuation_move' THEN em.email
          WHEN 'private_move' THEN pm.email
          WHEN 'secrecy_move' THEN sm.email
        END AS quotation_customer_email
      FROM accepted_bids ab
      JOIN bids b ON ab.bid_id = b.id
      JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN company_relocation cr ON b.quotation_id = cr.id 
        AND b.quotation_type = 'company_relocation'
      LEFT JOIN moving_cleaning mc ON b.quotation_id = mc.id 
        AND b.quotation_type = 'moving_cleaning'
      LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id 
        AND b.quotation_type = 'heavy_lifting'
      LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id 
        AND b.quotation_type = 'estate_clearance'
      LEFT JOIN evacuation_move em ON b.quotation_id = em.id 
        AND b.quotation_type = 'evacuation_move'
      LEFT JOIN private_move pm ON b.quotation_id = pm.id 
        AND b.quotation_type = 'private_move'
      LEFT JOIN secrecy_move sm ON b.quotation_id = sm.id 
        AND b.quotation_type = 'secrecy_move'
      WHERE b.id = ?
    `;

    const [bid] = await new Promise((resolve, reject) => {
      db.query(getBidQuery, [bid_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Validation checks
    if (!bid) {
      return res.status(404).json({ error: "Bid not found." });
    }

    console.log("bid.payment_status", bid.payment_status);

    if (!bid.payment_status) {
      return res.status(400).json({ error: "Payment status is missing" });
    }

    if (
      bid.payment_status.trim().toLowerCase() !== "pending" &&
      bid.payment_status.trim().toLowerCase() !== "awaiting_initial_payment" &&
      bid.payment_status.trim().toLowerCase() !== "initial_paid"
    ) {
      return res.status(400).json({
        error: "Payment already completed or in process.",
        errorSv: "Betalning redan genomförd eller under behandling.",
      });
    }

    if (!bid.quotation_customer_email) {
      return res.status(400).json({
        error: "Customer email not found for this quotation",
        errorSv: "Kundens e-postadress hittades inte för denna offert",
      });
    }

    if (
      customer_email.toLowerCase() !==
      bid.quotation_customer_email.toLowerCase()
    ) {
      return res.status(403).json({
        error: "Unauthorized: Email does not match quotation customer.",
        errorSv: "Obehörig: E-postadress matchar inte offertkunden.",
      });
    }

    const paymentType =
      bid.payment_status === "awaiting_initial_payment"
        ? "initial"
        : "remaining";
    // const isRutApplied = bid.rut_applied;
    // const rutAmount = isRutApplied ? bid.rut_amount : 0;
    const amount =
      paymentType === "initial" ? bid.initial_payment : bid.remaining_payment;
    const amountInOre = Math.round(amount * 100);

    if (amountInOre < 50) {
      return res.status(400).json({
        error: "Amount must be at least 0.50 SEK.",
        errorSv: "Beloppet måste vara minst 0,50 SEK.",
      });
    }

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email: customer_email,
      metadata: {
        bid_id: bid_id,
        quotation_type: bid.quotation_type,
      },
    });

    // Create Ephemeral Key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-04-10" }
    );

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInOre,
      currency: "sek",
      customer: customer.id,
      description: `Payment for ${bid.quotation_type} bid #${bid.bid_id}`,
      metadata: {
        bid_id: bid_id,
        quotation_type: bid.quotation_type,
        supplier_email: bid.supplier_email,
        customer_email: customer_email,
        order_id: bid.order_id,
        payment_type: paymentType,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update bid with payment intent ID and initial status
    const updatePaymentQuery = `
      UPDATE bids 
      SET 
        payment_intent_id = ?,
        payment_status = 'awaiting_payment',
        requires_payment_method = true,
        updated_at = NOW()
      WHERE id = ?
    `;

    // await new Promise((resolve, reject) => {
    //   db.query(updatePaymentQuery, [paymentIntent.id, bid_id], (err) =>
    //     err ? reject(err) : resolve()
    //   );
    // });

    // Return payment sheet details
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      bid_details: {
        amount: amountInOre / 100,
        supplier_name: bid.supplier_name,
        quotation_type: bid.quotation_type,
      },
    });
  } catch (error) {
    console.error("Error creating payment sheet:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports = { paymentSheet };
