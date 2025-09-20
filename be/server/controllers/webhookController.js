const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../../db/connect");
const emailService = require("../../utils/emailService");
const { getIO } = require("../../socket");

const handleWebhook = async (req, res) => {
  console.log("🔍 Webhook received");
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
    const paymentIntent = event.data.object;
    const { order_id, payment_type, customer_email } = paymentIntent.metadata;
    console.log("✅ Payment metadata:", paymentIntent.metadata);

    const connection = await db.promise().getConnection();
    // Fetch order details from checkout, accepted_bids, and quotation tables
    console.log("🔍 Fetching order details for order_id:", order_id);
    const [orderDetails] = await connection.query(
      `SELECT 
          c.customer_id, c.customer_name, c.total_price, c.rut_discount_applied, 
          ab.final_price, ab.payment_status, 
          s.email AS supplier_email, s.company_name AS supplier_name
       FROM checkout c
       JOIN accepted_bids ab ON c.order_id = ab.order_id
       JOIN bids b ON ab.bid_id = b.id
       JOIN suppliers s ON b.supplier_id = s.id
       WHERE c.order_id = ?`,
      [order_id]
    );

    const order = orderDetails[0];
    console.log("🔍 Retrieved order:", order ? "Found" : "Not found");
    if (!order) console.log(`❌ Order ${order_id} not found.`);

    // Use total_price from checkout as it already includes any RUT discount
    const adjustedTotalPrice = Math.round(order.total_price);
    console.log(
      "🔍 RUT discount applied:",
      order.rut_discount_applied ? "Yes" : "No"
    );
    console.log(
      "🔍 Final price from accepted_bids:",
      order.final_price,
      "Total price from checkout (used):",
      adjustedTotalPrice
    );

    const amountPaid =
      payment_type === "initial"
        ? Math.round(adjustedTotalPrice * 0.2)
        : Math.round(adjustedTotalPrice * 0.8);
    console.log(`🔍 ${payment_type} payment amount:`, amountPaid);

    // Handle different payment events
    console.log("🔍 Processing event type:", event.type);
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("🔍 Handling payment success");
        await handlePaymentSuccess(
          order_id,
          payment_type,
          amountPaid,
          order,
          customer_email
        );
        console.log("✅ Payment success handling complete");
        break;
      case "payment_intent.payment_failed":
        console.log("🔍 Handling payment failure");
        await handlePaymentFailure(order_id, payment_type);
        console.log("✅ Payment failure handling complete");
        break;
      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    console.log("✅ Webhook processing complete, sending response");
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      details: error.message,
    });
  }
};

const handlePaymentSuccess = async (
  order_id,
  payment_type,
  amountPaid,
  order,
  customer_email = ""
) => {
  console.log("🔍 Starting handlePaymentSuccess");
  console.log(
    `🔍 Parameters: order_id=${order_id}, payment_type=${payment_type}, amountPaid=${amountPaid}`
  );

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();
    console.log("🔍 Transaction begun");

    if (payment_type === "initial") {
      console.log("🔍 Processing initial payment");
      await connection.query(
        `UPDATE checkout
         SET amount_paid = ?, remaining_balance = total_price - ?,
         payment_status = 'partially_paid', updated_at = NOW()
         WHERE order_id = ?`,
        [amountPaid, amountPaid, order_id]
      );
      console.log("✅ Checkout table updated");

      await connection.query(
        `UPDATE accepted_bids 
         SET payment_status = 'initial_paid'
         WHERE order_id = ?`,
        [order_id]
      );
      console.log("✅ Accepted_bids table updated");

      console.log("🔍 Sending email to supplier:", order.supplier_email);
      await emailService.sendEmail(order.supplier_email, {
        subject: `Initialbetalning mottagen för Beställning #${order_id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Betalning Mottagen! 💰</h2>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
                Kära ${order.supplier_name},
              </p>
      
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                  <strong>Goda nyheter! Kunden har betalat den initiala 20 % insättningen för Beställning #${order_id}. Du kan nu gå vidare med flyttjänsten.
                </p>
              </div>
      
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://flyttman.se/supplier/orders/${order_id}" 
                   style="display: inline-block; 
                          background-color: #4CAF50; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          font-size: 16px;">
                  Visa Orderdetaljer
                </a>
              </div>
      
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                  <strong>Nästa Steg:
                  <br>1. Granska orderdetaljerna
                  <br>2. Kontakta kunden för att bekräfta schemat
                  <br>3. Börja flyttjänsten
                </p>
              </div>
      
              <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                Om du har några frågor, tveka inte att kontakta vårt supportteam.
              </p>
      
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #95a5a6; font-size: 12px; text-align: center;">
               Detta är ett automatiserat meddelande från Flyttman. Vänligen svara inte på detta mejl.
              </p>
            </div>
          </div>
        `,
      });
      console.log("✅ Initial payment email sent");
    } else if (payment_type === "remaining") {
      console.log("🔍 Processing remaining payment");
      await connection.query(
        `UPDATE checkout
         SET amount_paid = total_price, remaining_balance = 0,
         payment_status = 'paid', updated_at = NOW()
         WHERE order_id = ?`,
        [order_id]
      );
      console.log("✅ Checkout table updated");

      await connection.query(
        `UPDATE accepted_bids 
         SET payment_status = 'paid', order_status = 'completed'
         WHERE order_id = ?`,
        [order_id]
      );
      console.log("✅ Accepted_bids table updated");

      console.log("🔍 Sending email to supplier:", order.supplier_email);
      await emailService.sendEmail(order.supplier_email, {
        subject: `Slutbetalning mottagen för Beställning #${order_id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Slutbetalning Mottagen! 🎉</h2>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
                Kära ${order.supplier_name},
              </p>
      
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                  <strong>Goda nyheter! Kunden har slutfört slutbetalningen för Beställning #${order_id}. Beställningen är nu markerad som slutförd.
                </p>
              </div>
      
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://flyttman.se/supplier/orders/${order_id}" 
                   style="display: inline-block; 
                          background-color: #4CAF50; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          font-size: 16px;">
                  Visa Orderdetaljer
                </a>
              </div>
      
              <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                Tack för att du erbjuder utmärkt service genom Flyttman.
              </p>
      
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                Detta är ett automatiserat meddelande från Flyttman. Vänligen svara inte på detta mejl.
              </p>
            </div>
          </div>
        `,
      });
      console.log("✅ Supplier email sent");

      console.log("🔍 Sending confirmation email to customer:", customer_email);
      if (customer_email) {
        await emailService.sendEmail(customer_email, {
          subject: `Betalningsbekräftelse för Beställning #${order_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Betalning Lyckades ✅</h2>
                
                <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
                  Kära kund,
                </p>
        
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                    Din betalning på <strong>${amountPaid} SEK</strong> har framgångsrikt behandlats för Beställning #${order_id}.
                  </p>
                </div>
        
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://flyttman.se/customer/orders/${order_id}" 
                     style="display: inline-block; 
                            background-color: #3498db; 
                            color: white; 
                            padding: 12px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold;
                            font-size: 16px;">
                    Visa Orderdetaljer
                  </a>
                </div>
        
                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                  <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                    Vi hoppas att du är nöjd med vår service. Om du har ett ögonblick skulle vi uppskatta din feedback!
                  </p>
                </div>
        
                <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                  Tack för att du valde Flyttman för dina flyttbehov.
                </p>
        
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                  Detta är ett automatiserat meddelande från Flyttman. Vänligen svara inte på detta mejl.
                </p>
              </div>
            </div>
          `,
        });
        console.log("✅ Customer email sent");
      } else {
        console.log(
          "⚠️ No customer email provided, skipping customer notification"
        );
      }
    }

    await connection.commit();
    console.log("✅ Database transaction committed");
    connection.release();

    // Emit real-time payment update
    const io = getIO();
    console.log("🔍 Emitting socket event payment_update");
    io.emit("payment_update", {
      order_id,
      payment_type,
      status: "success",
      message: `${
        payment_type === "initial" ? "Initial" : "Remaining"
      } payment successful`,
    });
    console.log("✅ handlePaymentSuccess completed successfully");
  } catch (error) {
    console.error("❌ Error in handlePaymentSuccess:", error);
    await connection.rollback();
    connection.release();
    throw error;
  }
};

const handlePaymentFailure = async (order_id, payment_type) => {
  console.log("🔍 Starting handlePaymentFailure");
  console.log(
    `🔍 Parameters: order_id=${order_id}, payment_type=${payment_type}`
  );

  const connection = await db.promise();

  try {
    await connection.beginTransaction();
    console.log("🔍 Transaction begun");

    await connection.query(
      `UPDATE checkout 
       SET payment_status = ?, updated_at = NOW()
       WHERE order_id = ?`,
      [
        payment_type === "initial"
          ? "awaiting_initial_payment"
          : "awaiting_remaining_payment",
        order_id,
      ]
    );
    console.log("✅ Checkout table updated");

    await connection.commit();
    console.log("✅ Database transaction committed");

    const io = getIO();
    console.log("🔍 Emitting socket event payment_update for payment failure");
    io.emit("payment_update", {
      order_id,
      payment_type,
      status: "failed",
      message: "Payment failed. Please try again.",
    });
    console.log("✅ handlePaymentFailure completed successfully");
  } catch (error) {
    console.error("❌ Error in handlePaymentFailure:", error);
    await connection.rollback();
    throw error;
  }
};

module.exports = {
  handleWebhook,
};
