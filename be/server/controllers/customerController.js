const db = require("../../db/connect");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const emailService = require("../../utils/emailService");
const notificationService = require("../../utils/notificationService");
const {
  authenticateJWT,
  userIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");

exports.dashboard = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const userEmail = req.user.email;

    try {
      const quotationQueries = {
        companyRelocation: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM company_relocation WHERE email = ?`,
        movingCleaning: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM moving_cleaning WHERE email = ?`,
        heavyLifting: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM heavy_lifting WHERE email = ?`,
        estateClearance: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM estate_clearance WHERE email = ?`,
        evacuationMove: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM evacuation_move WHERE email = ?`,
        secrecyMove: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM secrecy_move WHERE email = ?`,
        privacyMove: `SELECT id, pickup_address, delivery_address, latest_date, services, created_at FROM private_move WHERE email = ?`,
      };

      // Orders query
      const ordersQuery = `
        SELECT  
          b.order_id,
          s.company_name AS mover_name,
          s.phone AS mover_contact,
          s.email AS mover_email,
          ab.payment_status,
          ab.final_price AS total_price,
          ab.order_status,
          ab.created_at AS order_created_at,
          q.pickup_address,
          q.delivery_address,
          q.latest_date,
          q.services,
          q.table_name AS service_type
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        JOIN accepted_bids ab ON b.id = ab.bid_id
        JOIN (
          SELECT id, 'company_relocation' AS table_name, email, pickup_address, delivery_address, latest_date, services FROM company_relocation
          UNION ALL
          SELECT id, 'moving_cleaning', email, pickup_address, delivery_address, latest_date, services FROM moving_cleaning
          UNION ALL
          SELECT id, 'heavy_lifting', email, pickup_address, delivery_address, latest_date, services FROM heavy_lifting
          UNION ALL
          SELECT id, 'estate_clearance', email, pickup_address, delivery_address, latest_date, services FROM estate_clearance
          UNION ALL
          SELECT id, 'evacuation_move', email, pickup_address, delivery_address, latest_date, services FROM evacuation_move
          UNION ALL
          SELECT id, 'secrecy_move', email, pickup_address, delivery_address, latest_date, services FROM secrecy_move
          UNION ALL
          SELECT id, 'private_move', email, pickup_address, delivery_address, latest_date, services FROM private_move
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
        WHERE q.email = ?
      `;

      // Disputes query
      const disputesQuery = `
        SELECT 
          d.id AS dispute_id,
          d.reason,
          d.request_details,
          d.status AS dispute_status,
          d.created_at AS dispute_created_at,
          b.order_id,
          s.company_name AS supplier_name,
          s.phone AS supplier_phone,
          s.email AS supplier_email,
          ab.final_price AS total_price,
          ab.order_status,
          ab.payment_status,
          ab.created_at AS order_created_at,
          q.pickup_address,
          q.delivery_address,
          q.latest_date,
          q.services,
          q.table_name AS service_type
        FROM disputes d
        JOIN bids b ON d.bid_id = b.id
        JOIN suppliers s ON d.against = s.id
        JOIN accepted_bids ab ON b.id = ab.bid_id
        JOIN (
          SELECT id, 'company_relocation' AS table_name, pickup_address, delivery_address, latest_date, services FROM company_relocation
          UNION ALL
          SELECT id, 'moving_cleaning', pickup_address, delivery_address, latest_date, services FROM moving_cleaning
          UNION ALL
          SELECT id, 'heavy_lifting', pickup_address, delivery_address, latest_date, services FROM heavy_lifting
          UNION ALL
          SELECT id, 'estate_clearance', pickup_address, delivery_address, latest_date, services FROM estate_clearance
          UNION ALL
          SELECT id, 'evacuation_move', pickup_address, delivery_address, latest_date, services FROM evacuation_move
          UNION ALL
          SELECT id, 'secrecy_move', pickup_address, delivery_address, latest_date, services FROM secrecy_move
          UNION ALL
          SELECT id, 'private_move', pickup_address, delivery_address, latest_date, services FROM private_move
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
        WHERE d.submitted_by = (SELECT id FROM customers WHERE email = ?)
      `;

      // Execute all queries
      const [quotations, orders, disputes] = await Promise.all([
        Promise.all(
          Object.entries(quotationQueries).map(([key, query]) => {
            return new Promise((resolve, reject) => {
              db.query(query, [userEmail], (err, rows) => {
                if (err) reject(err);
                resolve({ [key]: rows || [] });
              });
            });
          })
        ),
        new Promise((resolve, reject) => {
          db.query(ordersQuery, [userEmail], (err, rows) => {
            if (err) reject(err);
            resolve(rows || []);
          });
        }),
        new Promise((resolve, reject) => {
          db.query(disputesQuery, [userEmail], (err, rows) => {
            if (err) reject(err);
            resolve(rows || []);
          });
        }),
      ]);

      const formattedQuotations = quotations.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );

      res.status(200).json({
        message: "Welcome to your dashboard!",
        user: req.user,
        stats: {
          totalQuotations: Object.values(formattedQuotations).reduce(
            (count, rows) => count + (rows ? rows.length : 0),
            0
          ),
          totalOrders: orders.length,
          totalDisputes: disputes.length,
        },
        data: {
          quotations: formattedQuotations,
          orders,
          disputes,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res
        .status(500)
        .json({
          error: "Internal Server Error: Unable to fetch dashboard data.",
        });
    }
  },
];

exports.getCustomerData = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const userEmail = req.user.email;

    try {
      // Queries for fetching customer's quotations from all tables
      const quotationQueries = {
        companyRelocation: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM company_relocation
          WHERE email_address = ?
        `,
        moveOutCleaning: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM move_out_cleaning
          WHERE email_address = ?
        `,
        storage: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM storage
          WHERE email_address = ?
        `,
        heavyLifting: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM heavy_lifting
          WHERE email_address = ?
        `,
        carryingAssistance: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM carrying_assistance
          WHERE email_address = ?
        `,
        junkRemoval: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM junk_removal
          WHERE email_address = ?
        `,
        estateClearance: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM estate_clearance
          WHERE email_address = ?
        `,
        evacuationMove: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM evacuation_move
          WHERE email_address = ?
        `,
        privacyMove: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM private_move
          WHERE email_address = ?
        `,
        movingService: `
          SELECT id, from_city, to_city, move_date, type_of_service
          FROM moving_service
          WHERE email_address = ?
        `,
      };

      // Execute all quotation queries
      const quotationResults = {};
      const queryPromises = Object.entries(quotationQueries).map(
        ([key, query]) => {
          return new Promise((resolve, reject) => {
            db.query(query, [userEmail], (err, rows) => {
              if (err) reject(err);
              quotationResults[key] = rows;
              resolve();
            });
          });
        }
      );

      await Promise.all(queryPromises);

      // Fetch total count of quotations
      const totalQuotations = Object.values(quotationResults).reduce(
        (count, rows) => count + rows.length,
        0
      );

      // Fetch customer's bids
      const bidsQuery = `
        SELECT 
          b.id AS bid_id, 
          b.total_price, 
          b.status,
          b.quotation_type,
          q.from_city,
          q.to_city,
          q.move_date,
          q.type_of_service
        FROM bids b
        JOIN (
          SELECT 'company_relocation' AS table_name, id, email_address, from_city, to_city, move_date, type_of_service FROM company_relocation
          UNION ALL
          SELECT 'move_out_cleaning', id, email_address, from_city, to_city, move_date, type_of_service FROM move_out_cleaning
          UNION ALL
          SELECT 'storage', id, email_address, from_city, to_city, move_date, type_of_service FROM storage
          UNION ALL
          SELECT 'heavy_lifting', id, email_address, from_city, to_city, move_date, type_of_service FROM heavy_lifting
          UNION ALL
          SELECT 'carrying_assistance', id, email_address, from_city, to_city, move_date, type_of_service FROM carrying_assistance
          UNION ALL
          SELECT 'junk_removal', id, email_address, from_city, to_city, move_date, type_of_service FROM junk_removal
          UNION ALL
          SELECT 'estate_clearance', id, email_address, from_city, to_city, move_date, type_of_service FROM estate_clearance
          UNION ALL
          SELECT 'evacuation_move', id, email_address, from_city, to_city, move_date, type_of_service FROM evacuation_move
          UNION ALL
          SELECT 'private_move', id, email_address, from_city, to_city, move_date, type_of_service FROM private_move
          UNION ALL
          SELECT 'moving_service', id, email_address, from_city, to_city, move_date, type_of_service FROM moving_service
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
        WHERE q.email_address = ?
      `;

      const bids = await new Promise((resolve, reject) => {
        db.query(bidsQuery, [userEmail], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      // Total counts for bids and conversations
      const totalBids = bids.length;

      // Respond with data
      res.status(200).json({
        message: "Customer data fetched successfully.",
        user: req.user,
        totalQuotations,
        totalBids,
        quotations: quotationResults,
        bids,
      });
    } catch (error) {
      console.error("Error fetching customer data:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch customer data.",
      });
    }
  },
];

// user register
exports.register = async (req, res) => {
  try {
    const { password, fullname, email, phone_number, gender, order_pin } =
      req.body;

    // Validate required fields
    if (
      !password ||
      !fullname ||
      !email ||
      !phone_number ||
      !gender ||
      !order_pin
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check for duplicates in both customers and suppliers
    const checkCustomerQuery = `SELECT email, phone_num FROM customers WHERE email = ? OR phone_num = ?`;
    const checkSupplierQuery = `SELECT email, phone FROM suppliers WHERE email = ? OR phone = ?`;

    const [[customerExists], [supplierExists]] = await Promise.all([
      db.promise().query(checkCustomerQuery, [email, phone_number]),
      db.promise().query(checkSupplierQuery, [email, phone_number]),
    ]);

    if (customerExists.length > 0 || supplierExists.length > 0) {
      let existingFields = [];
      if (
        customerExists.some((row) => row.email === email) ||
        supplierExists.some((row) => row.email === email)
      ) {
        existingFields.push("email");
      }
      if (
        customerExists.some((row) => row.phone_num === phone_number) ||
        supplierExists.some((row) => row.phone === phone_number)
      ) {
        existingFields.push("phone number");
      }

      return res.status(409).json({
        error: `${existingFields.join(
          " and "
        )} already exists. Please use a different ${existingFields.join(
          " and "
        )}.`,
        errorSv: `${existingFields.join(
          " and "
        )} finns redan. Vänligen använd en annan ${existingFields.join(
          " and "
        )}.`,
      });
    }

    // Hash password and order pin in parallel
    const saltRounds = 10;
    const [hashedPassword, hashedOrderPin] = await Promise.all([
      bcrypt.hash(password, saltRounds),
      bcrypt.hash(order_pin, saltRounds),
    ]);

    // Insert new customer into the database
    const insertQuery = `
      INSERT INTO customers (password, fullname, email, phone_num, gender, order_pin)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      hashedPassword,
      fullname,
      email,
      phone_number,
      gender,
      hashedOrderPin,
    ];

    await db.promise().query(insertQuery, values);

    return res
      .status(201)
      .json({
        message: "Registration successful!",
        messageSv: "Registreringen lyckades!",
      });
  } catch (error) {
    console.error("Error in customer registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// user update information
exports.customerUpdateInfo = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const customer_id = req.user.id;
    const customer_email = req.user.email;
    const { fullname, password, phone_number, order_pin } = req.body;

    if (!fullname && !password && !phone_number && !order_pin) {
      return res.status(400).json({
        error: "At least one field to update is required.",
      });
    }

    const updates = [];
    const values = [];

    // Check for duplicates if phone number is provided
    if (phone_number) {
      try {
        const [existingPhone] = await db
          .promise()
          .query("SELECT id FROM customers WHERE phone_num = ? AND id != ?", [
            phone_number,
            customer_id,
          ]);

        if (existingPhone.length > 0) {
          return res.status(400).json({
            error: "Phone number already registered with another account.",
            errorSv: "Telefonnummer är redan registrerat på ett annat konto.",
          });
        }

        updates.push("phone_num = ?");
        values.push(phone_number);
      } catch (error) {
        console.error("Error checking phone number:", error);
        return res.status(500).json({
          error: "Internal Server Error: Unable to validate phone number.",
        });
      }
    }

    if (fullname) {
      updates.push("fullname = ?");
      values.push(fullname);
    }

    const processUpdate = async () => {
      try {
        if (order_pin) {
          const pinString = order_pin.toString();
          if (pinString.length !== 4 || !/^[0-9]{4}$/.test(pinString)) {
            return res.status(400).json({
              error: "Order PIN must be exactly 4 digits",
              errorSv: "Order PIN måste vara exakt 4 siffror",
            });
          }
          const hashedPin = await bcrypt.hash(pinString, 10);
          updates.push("order_pin = ?");
          values.push(hashedPin);
        }

        if (password) {
          const hashedPassword = await bcrypt.hash(password.toString(), 10);
          updates.push("password = ?");
          values.push(hashedPassword);
        }

        values.push(customer_id);

        const query = `
          UPDATE customers
          SET ${updates.join(", ")}
          WHERE id = ?
        `;

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Customer not found." });
        }

        try {
          await notificationService.createNotification({
            recipientId: customer_email,
            recipientType: "customer",
            title: "Profil uppdaterad",
            message: "Din profilinformation har uppdaterats framgångsrikt.",
            type: "profile_update",
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }

        return res.status(200).json({
          message: "Customer information updated successfully!",
        });
      } catch (error) {
        console.error("Error updating customer info:", error);

        // Check for unique constraint violations
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            error: "Phone number or email already exists.",
            errorSv: "Telefonnummer eller e-postadress finns redan.",
          });
        }

        return res.status(500).json({
          error: "Internal Server Error: Unable to update customer info.",
          errorSv: "Internt serverfel: Kunde inte uppdatera kundinformation.",
        });
      }
    };

    processUpdate().catch((error) => {
      console.error("Error in update process:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to process update.",
        errorSv: "Internt serverfel: Kunde inte bearbeta uppdateringen.",
      });
    });
  },
];

// stripe payment
exports.customerPayment = async (req, res) => {
  try {
    const { bid_id, customer_email, payment_method_id } = req.body;

    if (!bid_id || !customer_email || !payment_method_id) {
      return res.status(400).json({
        error: "Bid ID, customer email, and payment method ID are required.",
      });
    }

    const getBidQuery = `
      SELECT 
        b.id AS bid_id, 
        b.bid_price, 
        b.total_price, 
        b.payment_status,
        b.payment_method,
        b.requires_payment_method,
        b.quotation_type,
        b.quotation_id,
        s.company_name AS supplier_name, 
        s.email AS supplier_email,
        CASE b.quotation_type
          WHEN 'company_relocation' THEN cr.email_address
          WHEN 'move_out_cleaning' THEN mc.email_address
          WHEN 'storage' THEN st.email_address
          WHEN 'heavy_lifting' THEN hl.email_address
          WHEN 'carrying_assistance' THEN ca.email_address
          WHEN 'junk_removal' THEN jr.email_address
          WHEN 'estate_clearance' THEN ec.email_address
          WHEN 'evacuation_move' THEN em.email_address
          WHEN 'private_move' THEN pm.email_address
          WHEN 'local_move' THEN ms.email_address
          WHEN 'long_distance_move' THEN ms.email_address
          WHEN 'moving_abroad' THEN ms.email_address
        END AS quotation_customer_email
      FROM bids b
      JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN moving_service ms ON b.quotation_id = ms.id 
        AND b.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad')
      LEFT JOIN company_relocation cr ON b.quotation_id = cr.id 
        AND b.quotation_type = 'company_relocation'
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
      LEFT JOIN private_move pm ON b.quotation_id = pm.id 
        AND b.quotation_type = 'private_move'
      WHERE b.id = ?
    `;

    const [bid] = await new Promise((resolve, reject) => {
      db.query(getBidQuery, [bid_id], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (!bid) {
      return res.status(404).json({ error: "Bid not found." });
    }

    // Validate payment status
    if (!bid.payment_status) {
      return res.status(400).json({ error: "Payment status is missing" });
    }

    if (bid.payment_status.trim().toLowerCase() !== "pending") {
      return res.status(400).json({
        error: "Payment already completed or in process.",
      });
    }

    // Validate customer email
    if (!bid.quotation_customer_email) {
      return res.status(400).json({
        error: "Customer email not found for this quotation",
      });
    }

    if (
      customer_email.toLowerCase() !==
      bid.quotation_customer_email.toLowerCase()
    ) {
      return res.status(403).json({
        error: "Unauthorized: Email does not match quotation customer.",
      });
    }

    const amountInOre = Math.round(bid.total_price * 100);

    if (amountInOre < 50) {
      return res.status(400).json({
        error: "Amount must be at least 0.50 SEK.",
      });
    }

    // Create payment intent with webhook handling
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInOre,
      currency: "sek",
      payment_method: payment_method_id,
      confirm: true,
      description: `Payment for ${bid.quotation_type} bid #${bid.bid_id}`,
      receipt_email: bid.quotation_customer_email,
      metadata: {
        bid_id: bid.bid_id,
        quotation_type: bid.quotation_type,
        supplier_email: bid.supplier_email,
      },
    });

    // Update payment status in database
    const updatePaymentQuery = `
      UPDATE bids 
      SET 
        payment_intent_id = ?, 
        payment_status = 'processing',
        payment_method = 'debit_card',
        requires_payment_method = false,
        updated_at = NOW()
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(updatePaymentQuery, [paymentIntent.id, bid_id], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // The actual payment confirmation and email sending will be handled by webhook
    return res.status(200).json({
      message: "Payment initiated successfully.",
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amountInOre / 100,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    if (error.type === "StripeCardError") {
      // Update payment status to failed
      try {
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE bids SET payment_status = 'failed', updated_at = NOW() WHERE id = ?`,
            [req.body.bid_id],
            (err) => (err ? reject(err) : resolve())
          );
        });
      } catch (dbError) {
        console.error("Error updating payment status:", dbError);
      }

      return res.status(400).json({
        error: "Payment failed. Please try again.",
      });
    }

    return res.status(500).json({
      error: "Internal Server Error.",
      details: error.message,
    });
  }
};

const quotationTables = [
  "private_move",
  "moving_cleaning",
  "heavy_lifting",
  "company_relocation",
  "estate_clearance",
  "evacuation_move",
  "secrecy_move",
];

exports.rejectBid = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const { bid_id } = req.body;
      const customerEmail = req.user.email; // Get the logged-in user's email

      if (!bid_id) {
        return res.status(400).json({ error: "Bid ID is required." });
      }

      // Fetch bid details, including quotation type and status
      const [bidResult] = await db.promise().query(
        `SELECT b.id, b.order_id, b.supplier_id, b.quotation_type, b.quotation_id, b.status, s.email AS supplier_email, s.company_name AS supplier_name
         FROM bids b 
         JOIN suppliers s ON b.supplier_id = s.id
         WHERE b.id = ?`,
        [bid_id]
      );

      if (!bidResult.length) {
        return res.status(404).json({ error: "Bid not found." });
      }

      const bidData = bidResult[0];
      const {
        quotation_type,
        quotation_id,
        order_id,
        supplier_id,
        status,
        supplier_email,
        supplier_name,
      } = bidData;

      // Ensure bid is approved before allowing rejection
      if (status !== "approved") {
        return res
          .status(400)
          .json({ error: "Only approved bids can be rejected." });
      }

      // Validate the quotation type against the list of tables
      if (!quotationTables.includes(quotation_type)) {
        return res.status(400).json({ error: "Invalid quotation type." });
      }

      const quotationTable = quotation_type; // Get the correct table name

      // Fetch customer email from the correct quotation table
      const [quotationResult] = await db
        .promise()
        .query(`SELECT email FROM ${quotationTable} WHERE id = ?`, [
          quotation_id,
        ]);

      if (!quotationResult.length) {
        return res.status(404).json({ error: "Quotation not found." });
      }

      const quotationOwnerEmail = quotationResult[0].email;

      // Ensure the logged-in user is the owner of the quotation
      if (quotationOwnerEmail !== customerEmail) {
        return res
          .status(403)
          .json({ error: "Access denied. You do not own this quotation." });
      }

      // Update bid status in accepted_bids and bids table
      await db.promise().query(
        `UPDATE accepted_bids 
         SET customer_rejected = TRUE 
         WHERE order_id = ?`,
        [order_id]
      );

      await db.promise().query(
        `UPDATE bids 
         SET customer_rejected_at = NOW() 
         WHERE id = ?`,
        [bid_id]
      );

      // Send Email to Supplier
      await emailService.sendEmail(supplier_email, {
        subject: `Meddelande om budavslag`,
        html: `
          <p>Bästa ${supplier_name},</p>
          <p>Vi beklagar att meddela att kunden har avvisat ditt bud för order-ID ${order_id}.</p>
          <p>Om du har några frågor, vänligen kontakta supporten.</p>
        `,
      });

      // Send Email to Admin
      await emailService.sendEmail("admin@flyttman.com", {
        subject: `Customer Rejected a Bid`,
        html: `
          <p>Admin,</p>
          <p>A customer has rejected a bid for order ID ${order_id}.</p>
          <p>Please review the details in the admin panel.</p>
        `,
      });

      res
        .status(200)
        .json({
          message: "Bid rejected successfully, and emails have been sent.",
          messageSv:
            "Budet har avvisats framgångsrikt och e-postmeddelanden har skickats.",
        });
    } catch (error) {
      console.error("Error rejecting bid:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

exports.orderDetails = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const { orderId } = req.params;
    const userEmail = req.user.email;

    try {
      if (!orderId || !orderId.includes("-")) {
        return res.status(400).json({ error: "Invalid order ID format" });
      }

      const [quotationType, quotationId, bidId] = orderId.split("-");

      const query = `
        SELECT 
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_number,
          s.company_name AS mover_name,
          s.phone AS mover_contact,
          s.email AS mover_email,
          b.payment_method,
          b.total_price AS amount_paid,
          b.escrow_release_date,
          CASE 
            WHEN b.escrow_release_date > NOW() THEN 'pending'
            ELSE 'completed'
          END AS escrow_service,
          b.order_status AS order_status,
          b.payment_status,
          b.created_at,
          q.from_city,
          q.to_city AS delivery_address,
          q.type_of_service,
          q.move_date,
          CASE q.table_name
            WHEN 'carrying_assistance' THEN q.type_of_items_to_carry
            WHEN 'company_relocation' THEN q.list_of_larger_items
            WHEN 'estate_clearance' THEN q.type_of_items_to_clear
            WHEN 'evacuation_move' THEN q.evacuation_reason
            WHEN 'heavy_lifting' THEN q.type_of_items
            WHEN 'junk_removal' THEN q.type_of_junk
            WHEN 'move_out_cleaning' THEN q.specific_cleaning_requests
            WHEN 'private_move' THEN q.specific_requirements
            WHEN 'storage' THEN q.type_of_items_to_store
          END AS items,
          q.table_name AS service_type,
          r.id AS review_id,
          r.satisfaction_rating,
          r.feedback_text,
          r.issues_reported,
          r.damage_reported,
          r.evidence_urls,
          CASE 
            WHEN r.id IS NULL THEN FALSE
            ELSE TRUE
          END AS has_review
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN reviews r ON r.bid_id = b.id
        JOIN (
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'carrying_assistance' AS table_name
          FROM carrying_assistance WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'company_relocation' AS table_name
          FROM company_relocation WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'estate_clearance' AS table_name
          FROM estate_clearance WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'evacuation_move' AS table_name
          FROM evacuation_move WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'heavy_lifting' AS table_name
          FROM heavy_lifting WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'junk_removal' AS table_name
          FROM junk_removal WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            specific_cleaning_requests,
            NULL as specific_requirements,
            NULL as type_of_items_to_store,
            'move_out_cleaning' AS table_name
          FROM move_out_cleaning WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            specific_requirements,
            NULL as type_of_items_to_store,
            'private_move' AS table_name
          FROM private_move WHERE email_address = ?
          
          UNION ALL
          
          SELECT 
            id, email_address, from_city, to_city, type_of_service, move_date,
            NULL as type_of_items_to_carry,
            NULL as list_of_larger_items,
            NULL as type_of_items_to_clear,
            NULL as evacuation_reason,
            NULL as type_of_items,
            NULL as type_of_junk,
            NULL as specific_cleaning_requests,
            NULL as specific_requirements,
            type_of_items_to_store,
            'storage' AS table_name
          FROM storage WHERE email_address = ?
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
        WHERE b.id = ? 
        AND b.quotation_type = ?
        AND b.quotation_id = ?
        LIMIT 1
      `;

      const params = [
        ...Array(9).fill(userEmail),
        bidId,
        quotationType,
        quotationId,
      ];

      const order = await new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
          if (err) {
            console.error("Query error:", err);
            return reject(err);
          }
          resolve(results && results.length ? results[0] : null);
        });
      });

      if (!order) {
        return res.status(404).json({
          error: "Order not found or you don't have permission to view it",
        });
      }

      res.status(200).json({
        message: "Order details fetched successfully",
        data: {
          ...order,
          items: order.items || null,
          created_at: new Date(order.created_at).toISOString(),
          move_date: order.move_date
            ? new Date(order.move_date).toISOString()
            : null,
          escrow_release_date: order.escrow_release_date
            ? new Date(order.escrow_release_date).toISOString()
            : null,
          review: order.has_review
            ? {
                id: order.review_id,
                rating: order.satisfaction_rating,
                feedback: order.feedback_text,
                has_issues: order.issues_reported,
                has_damage: order.damage_reported,
                evidence_urls: order.evidence_urls
                  ? JSON.parse(order.evidence_urls)
                  : [],
              }
            : null,
          needs_review: !order.has_review && order.order_status === "completed",
        },
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch order details",
      });
    }
  },
];

exports.fileComplaint = [
  authenticateJWT,
  userIsLoggedIn,
  (req, res) => {
    const { quotation_id, quotation_type, category, description, photo_url } =
      req.body;
    const customer_email = req.user.email;
    const customer_id = req.user.id;

    if (!quotation_id || !quotation_type || !category || !description) {
      return res.status(400).json({
        error:
          "Quotation ID, quotation type, category, and description are required.",
      });
    }

    const regularTypes = [
      "company_relocation",
      "move_out_cleaning",
      "storage",
      "heavy_lifting",
      "carrying_assistance",
      "junk_removal",
      "estate_clearance",
      "evacuation_move",
      "private_move",
    ];

    const movingServiceTypes = [
      "local_move",
      "long_distance_move",
      "moving_abroad",
    ];

    const allowedTypes = [...regularTypes, ...movingServiceTypes];

    if (!allowedTypes.includes(quotation_type)) {
      return res
        .status(400)
        .json({ error: "Invalid quotation type provided." });
    }

    // Different validation queries for regular and moving services
    const validateQuotationQuery = movingServiceTypes.includes(quotation_type)
      ? `
        SELECT email_address 
        FROM moving_service 
        WHERE id = ? 
        AND email_address = ?
        AND JSON_CONTAINS(type_of_service, '"${quotation_type}"', '$')
      `
      : `
        SELECT email_address 
        FROM ${quotation_type} 
        WHERE id = ?
        AND email_address = ?
      `;

    db.query(
      validateQuotationQuery,
      [quotation_id, customer_email],
      (err, results) => {
        if (err) {
          console.error("Error validating quotation:", err);
          return res.status(500).json({ error: "Internal Server Error." });
        }

        if (results.length === 0) {
          return res.status(404).json({
            error: "No matching quotation found for the provided ID and email.",
          });
        }

        const insertComplaintQuery = `
        INSERT INTO complaints (
          customer_id, quotation_id, quotation_type, category, description, photo_url
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

        db.query(
          insertComplaintQuery,
          [
            customer_id,
            quotation_id,
            quotation_type,
            category,
            description,
            photo_url || null,
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error("Error creating complaint:", insertErr);
              return res.status(500).json({ error: "Internal Server Error." });
            }

            res.status(201).json({
              message: "Complaint submitted successfully.",
              complaintId: result.insertId,
            });
          }
        );
      }
    );
  },
];

exports.getCustomerComplaints = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    const customerId = req.user.id;

    try {
      const query = `
        SELECT id, quotation_id, category, description, photo_url, status, created_at, resolved_at
        FROM complaints
        WHERE customer_id = ?
        ORDER BY created_at DESC
      `;

      const complaints = await new Promise((resolve, reject) => {
        db.query(query, [customerId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      return res.status(200).json({ complaints });
    } catch (error) {
      console.error("Error fetching complaints:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.userLogout = (req, res) => {
  try {
    // Clear authentication cookies (if used)
    res.clearCookie("user_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      message: "User logout successful!",
      messageSv: "Utloggning av användare lyckades!",
    });
  } catch (err) {
    console.error("Error during user logout:", err);
    return res.status(500).json({
      error: "Internal Server Error: Unable to log out user.",
    });
  }
};

exports.supplierLogout = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      // Ensure admin is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      // Clear the JWT from cookies
      res.clearCookie("user_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({ message: "User logout successful!" });
    } catch (error) {
      console.error("Error logging out admin:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to log out User.",
      });
    }
  },
];

exports.getNotifications = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const userId = req.user.id;
      const userType = req.user.type || "customer"; // Get user type from jwt

      console.log("Fetching notifications for:", { userId, userType });

      const notifications = await notificationService.getUserNotifications(
        userId,
        userType,
        page,
        limit
      );

      if (!notifications.length) {
        console.log("No notifications found for user:", { userId, userType });
      }

      res.status(200).json({
        message: "Notifications fetched successfully.",
        notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.markNotificationRead = [
  authenticateJWT,
  userIsLoggedIn,
  async (req, res) => {
    try {
      const { notificationId } = req.params;

      await notificationService.markAsRead(notificationId, req.user.id);

      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
