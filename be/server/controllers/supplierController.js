const db = require("../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../utils/notificationService");
const {
  authenticateJWT,
  supplierIsLoggedIn,
} = require("../controllers/loginController/authMiddleware");

// supplier Register
exports.registerSupplier = (req, res) => {
  const {
    company_name,
    contact_person,
    address,
    postal_code,
    city,
    organization_number,
    started_year,
    trucks,
    phone,
    email,
    password,
    about_us,
    bank,
    account_number,
    iban,
    swift_code,
  } = req.body;

  // Validate required fields
  if (
    !company_name.trim() ||
    !contact_person.trim() ||
    !address.trim() ||
    !postal_code.trim() ||
    !city.trim() ||
    !organization_number.trim() ||
    !started_year.trim() ||
    !phone.trim() ||
    !email.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({ error: "All fields are required.", errorSv: "Alla fält är obligatoriska." });
  }

  // Check for duplicate email, phone, or organization number
  const checkQuery = `
      SELECT id FROM suppliers WHERE email = ? OR phone = ? OR organization_number = ?
    `;
  db.query(
    checkQuery,
    [email, phone, organization_number],
    (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking for duplicates:", checkErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (checkResults.length > 0) {
        return res.status(409).json({
          error: "Email, phone number, or organization number already exists.",
          errorSv: "E-postadress, telefonnummer eller organisationsnummer finns redan.",
        });
      }

      // Hash the password
      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error("Error hashing password:", hashErr);
          return res
            .status(500)
            .json({ error: "Internal Server Error: Unable to hash password." });
        }

        // Insert supplier data
        const query = `
          INSERT INTO suppliers (
            company_name, contact_person, address, postal_code, city, organization_number,
            started_year, trucks, phone, email, password, about_us, bank, account_number, iban, swift_code
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          company_name,
          contact_person,
          address,
          postal_code,
          city,
          organization_number,
          started_year,
          parseInt(trucks, 10) || 0, // Ensure trucks is an integer
          phone,
          email,
          hashedPassword,
          about_us || null,
          bank || null,
          account_number || null,
          iban || null,
          swift_code || null,
        ];

        db.query(query, values, (insertErr) => {
          if (insertErr) {
            console.error("Error inserting supplier data:", insertErr);
            return res
              .status(500)
              .json({ error: "Internal Server Error: Unable to insert data." });
          }

          return res
            .status(201)
            .json({ message: "Supplier registered successfully!", messageSv: "Leverantör registrerad framgångsrikt!" });
        });
      });
    }
  );
};

// supplier Login
exports.supplierLogin = (req, res) => {
  const { identifier, password } = req.body;

  // Validate input
  if (!identifier || !password) {
    return res.status(400).json({
      error: "Both identifier (email or phone) and password are required.",
    });
  }

  // Check if the supplier exists by email or phone
  const query = `
      SELECT id, email, phone, password, company_name 
      FROM suppliers 
      WHERE email = ? OR phone = ?
    `;
  db.query(query, [identifier, identifier], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch supplier data.",
      });
    }

    // If no supplier is found
    if (results.length === 0) {
      return res.status(404).json({ error: "Supplier not found." });
    }

    // Validate the password
    const supplier = results[0];
    bcrypt.compare(password, supplier.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("Error comparing passwords:", bcryptErr);
        return res.status(500).json({
          error: "Internal Server Error: Unable to validate password.",
        });
      }

      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "Invalid email/phone or password." });
      }

      //  supplier info is saved in session
      req.supplier = {
        id: supplier.id,
        company_name: supplier.company_name,
        email: supplier.email,
        phone: supplier.phone,
      };

      // Successful login
      return res.status(200).json({
        message: "Login successful!",
        supplier: {
          company_name: supplier.company_name,
          email: supplier.email,
          phone: supplier.phone,
        },
      });
    });
  });
};

// getiing customer quottaions
exports.customerQuotations = [
  authenticateJWT,
  supplierIsLoggedIn,
  (req, res) => {
    // Define queries for the required fields from all tables
    const queries = {
      companyRelocation: `
          SELECT from_city, to_city, move_date, type_of_service FROM company_relocation
        `,
      moveOutCleaning: `
          SELECT from_city, to_city, move_date, type_of_service FROM move_out_cleaning
        `,
      storage: `
          SELECT from_city, to_city, move_date, type_of_service FROM storage
        `,
      heavyLifting: `
          SELECT from_city, to_city, move_date, type_of_service FROM heavy_lifting
        `,
      carryingAssistance: `
          SELECT from_city, to_city, move_date, type_of_service FROM carrying_assistance
        `,
      junkRemoval: `
          SELECT from_city, to_city, move_date, type_of_service FROM junk_removal
        `,
      estateClearance: `
          SELECT from_city, to_city, move_date, type_of_service FROM estate_clearance
        `,
      evacuationMove: `
          SELECT from_city, to_city, move_date, type_of_service FROM evacuation_move
        `,
      privacyMove: `
          SELECT from_city, to_city, move_date, type_of_service FROM private_move
        `,
    };

    // Execute all queries and collect results
    const results = {};
    const queryPromises = Object.entries(queries).map(([key, query]) => {
      return new Promise((resolve, reject) => {
        db.query(query, (err, rows) => {
          if (err) {
            console.error(`Error fetching data from ${key}:`, err);
            return reject(err);
          }
          results[key] = rows; // Store the result for each table
          resolve();
        });
      });
    });

    // Wait for all queries to complete
    Promise.all(queryPromises)
      .then(() => {
        return res.status(200).json({
          message: "Customer quotations fetched successfully!",
          data: results,
        });
      })
      .catch((err) => {
        console.error("Error fetching customer quotations:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error: Unable to fetch data." });
      });
  },
];

// sending a bid on a quotation
exports.sendBid = [
  authenticateJWT,
  supplierIsLoggedIn,
  (req, res) => {
    const {
      quotation_id,
      quotation_type,
      moving_cost,
      truck_cost = 0,
      additional_services,
      invoice,
      supplier_notes,
      estimated_completion_date,
    } = req.body;

    // Validate required fields
    if (!quotation_id || !quotation_type || !moving_cost) {
      return res.status(400).json({
        error: "Quotation ID, quotation type, and moving cost are required.",
      });
    }

    // Validate quotation type
    const allowedTypes = [
      "estate_clearance",
      "evacuation_move",
      "secrecy_move",
      "private_move",
      "moving_cleaning",
      "heavy_lifting",
      "company_relocation",
    ];

    if (!allowedTypes.includes(quotation_type)) {
      return res
        .status(400)
        .json({ error: "Invalid quotation type provided." });
    }

    const supplier_id = req.user.id;

    if (!supplier_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Please log in as a supplier." });
    }

    // Check if the quotation exists and is open
    const validateQuotationQuery = `
      SELECT id FROM ${quotation_type}
      WHERE id = ? AND status = 'open'
    `;

    db.query(validateQuotationQuery, [quotation_id], (err, results) => {
      if (err) {
        console.error("Error validating quotation:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Quotation not found or not open.", errorSv: "Offert hittades inte eller är inte öppen." });
      }

      // Generate Order ID (Format: BID-YYYYMMDD-XXX)
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const order_id = `BID-${datePart}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      // Prepare insert query
      const insertBidQuery = `
        INSERT INTO bids (
          order_id, supplier_id, quotation_id, quotation_type, 
          moving_cost, truck_cost, additional_services, 
          invoice, status, created_at, supplier_notes, estimated_completion_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), ?, ?)
      `;

      const bidParams = [
        order_id,
        supplier_id,
        quotation_id,
        quotation_type,
        moving_cost,
        truck_cost,
        JSON.stringify(additional_services || []),
        invoice || null,
        supplier_notes || null,
        estimated_completion_date || null,
      ];

      db.query(insertBidQuery, bidParams, async (insertErr, result) => {
        if (insertErr) {
          console.error("Error inserting bid data:", insertErr);
          return res
            .status(500)
            .json({ error: "Internal Server Error: Unable to submit bid." });
        }

        try {
          // Notify admin about the new bid
          await notificationService.createNotification({
            recipientId: "admin",
            recipientType: "admin",
            title: "New Bid Submitted",
            message: `Supplier submitted a bid for ${quotation_type} (ID: ${quotation_id}).`,
            type: "new_bid",
          });
        } catch (notificationErr) {
          console.error("Error sending notification:", notificationErr);
        }

        // Respond with success message
        res.status(201).json({
          message: "Bid submitted successfully!",
          bidId: result.insertId,
          order_id,
        });
      });
    });
  },
];

// viewing the quotation assocaited with the bid
exports.viewQuotationWithBid = (req, res) => {
  const { bid_id } = req.params;

  // Validate input
  if (!bid_id) {
    return res.status(400).json({ error: "Bid ID is required." });
  }

  // Step 1: Fetch the quotation_type and quotation_id from the bids table
  const getBidDetailsQuery = `
      SELECT quotation_type, quotation_id, bid_price, additional_notes, created_at AS bid_created_at
      FROM bids
      WHERE id = ?
    `;

  db.query(getBidDetailsQuery, [bid_id], (bidErr, bidResults) => {
    if (bidErr) {
      console.error("Error fetching bid details:", bidErr);
      return res
        .status(500)
        .json({ error: "Internal Server Error: Unable to fetch bid details." });
    }

    if (bidResults.length === 0) {
      return res.status(404).json({ error: "Bid not found." });
    }

    // Extract details from the bid
    const {
      quotation_type,
      quotation_id,
      bid_price,
      additional_notes,
      bid_created_at,
    } = bidResults[0];

    // Step 2: Fetch the quotation details from the relevant table
    const getQuotationDetailsQuery = `
        SELECT from_city, to_city, move_date, type_of_service
        FROM ${quotation_type}
        WHERE id = ?
      `;

    db.query(
      getQuotationDetailsQuery,
      [quotation_id],
      (quoteErr, quoteResults) => {
        if (quoteErr) {
          console.error(
            `Error fetching quotation from ${quotation_type}:`,
            quoteErr
          );
          return res.status(500).json({
            error: "Internal Server Error: Unable to fetch quotation details.",
          });
        }

        if (quoteResults.length === 0) {
          return res
            .status(404)
            .json({ error: "Quotation not found for the provided bid." });
        }

        // Combine bid and quotation data
        return res.status(200).json({
          message: "Quotation with linked bid retrieved successfully.",
          bid: {
            bid_id,
            bid_price,
            additional_notes,
            bid_created_at,
            quotation_type,
            quotation_id,
          },
          quotation: quoteResults[0], // Quotation details
        });
      }
    );
  });
};

//
exports.viewAllQuotationWithBid = (req, res) => {
  const { quotation_id, quotation_type } = req.params;

  // Validate input
  if (!quotation_id || !quotation_type) {
    return res
      .status(400)
      .json({ error: "Quotation ID and quotation type are required." });
  }

  // Update allowed types to include moving service types
  const allowedTypes = [
    "company_relocation",
    "move_out_cleaning",
    "storage",
    "heavy_lifting",
    "carrying_assistance",
    "junk_removal",
    "estate_clearance",
    "evacuation_move",
    "private_move",
    "local_move",
    "long_distance_move",
    "moving_abroad",
  ];

  if (!allowedTypes.includes(quotation_type)) {
    return res.status(400).json({ error: "Invalid quotation type provided." });
  }

  // Determine if this is a moving service type
  const isMovingService = [
    "local_move",
    "long_distance_move",
    "moving_abroad",
  ].includes(quotation_type);

  // Step 1: Fetch the quotation details with modified query for moving service
  const getQuotationDetailsQuery = isMovingService
    ? `
      SELECT from_city, to_city, move_date, type_of_service
      FROM moving_service
      WHERE id = ?
      AND JSON_CONTAINS(type_of_service, ?, '$')
    `
    : `
      SELECT from_city, to_city, move_date, type_of_service
      FROM ${quotation_type}
      WHERE id = ?
    `;

  const queryParams = isMovingService
    ? [quotation_id, `"${quotation_type}"`]
    : [quotation_id];

  db.query(getQuotationDetailsQuery, queryParams, (quoteErr, quoteResults) => {
    if (quoteErr) {
      console.error(
        `Error fetching quotation details from ${
          isMovingService ? "moving_service" : quotation_type
        }:`,
        quoteErr
      );
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch quotation details.",
      });
    }

    if (quoteResults.length === 0) {
      return res.status(404).json({ error: "Quotation not found." });
    }

    const quotationDetails = quoteResults[0];

    // Step 2: Fetch all bids linked to the quotation
    const getBidsQuery = `
        SELECT id AS bid_id, supplier_id, bid_price, additional_notes, created_at
        FROM bids
        WHERE quotation_id = ? AND quotation_type = ?
      `;

    db.query(
      getBidsQuery,
      [quotation_id, quotation_type],
      (bidsErr, bidsResults) => {
        if (bidsErr) {
          console.error("Error fetching bids:", bidsErr);
          return res
            .status(500)
            .json({ error: "Internal Server Error: Unable to fetch bids." });
        }

        // Combine quotation details with associated bids
        return res.status(200).json({
          message: "Quotation with all linked bids retrieved successfully.",
          quotation: quotationDetails,
          bids: bidsResults,
        });
      }
    );
  });
};

// suppliers marketplace
exports.marketPlace = [
  authenticateJWT,
  supplierIsLoggedIn,
  (req, res) => {
    const {
      pickup_address,
      delivery_address,
      move_date,
      service_type,
      page = 1,
    } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM (
        SELECT 
          'estate_clearance' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM estate_clearance
          WHERE status = 'open'
        UNION ALL
        SELECT 
          'evacuation_move' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM evacuation_move
          WHERE status = 'open'
        UNION ALL
        SELECT 
          'secrecy_move' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM secrecy_move
          WHERE status = 'open'
        UNION ALL
        SELECT 
          'private_move' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM private_move
          WHERE status = 'open'
        UNION ALL
        SELECT 
          'moving_cleaning' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM moving_cleaning
          WHERE status = 'open'
        UNION ALL
        SELECT 
          'heavy_lifting' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM heavy_lifting
          WHERE status = 'open'
        UNION ALL
        SELECT 
          'company_relocation' AS table_name, id, pickup_address, delivery_address, date AS move_date, service_type, created_at, status 
          FROM company_relocation
          WHERE status = 'open'
      ) q
      LEFT JOIN bids b ON b.quotation_id = q.id AND b.quotation_type = q.table_name
    `;

    let countQuery = `SELECT COUNT(DISTINCT CONCAT(q.table_name, '_', q.id)) as total ${baseQuery}`;

    let query = `
    SELECT 
      q.id AS quotation_id,
      q.table_name,
      q.pickup_address,
      q.delivery_address,
      q.move_date,
      q.service_type,
      q.status,
      q.created_at AS quotation_created_at,
      b.id AS bid_id,
      b.supplier_id,
      b.moving_cost,
      ab.final_price AS total_price, -- Fetching from accepted_bids instead of bids
      b.supplier_notes,
      b.created_at AS bid_created_at,
      b.status AS bid_status
    ${baseQuery}
    LEFT JOIN accepted_bids ab ON ab.bid_id = b.id -- Ensuring final_price is from accepted_bids
  `;

    const filters = [];
    if (pickup_address)
      filters.push(`q.pickup_address LIKE '%${pickup_address}%'`);
    if (delivery_address)
      filters.push(`q.delivery_address LIKE '%${delivery_address}%'`);
    if (move_date) filters.push(`q.move_date = '${move_date}'`);
    if (service_type) filters.push(`q.service_type LIKE '%${service_type}%'`);

    if (filters.length > 0) {
      const whereClause = ` WHERE ${filters.join(" AND ")}`;
      query += whereClause;
      countQuery += whereClause;
    }

    // **Sorting by the most recent order**
    query += ` ORDER BY q.created_at DESC, q.move_date DESC LIMIT ${limit} OFFSET ${offset}`;

    // First get total count
    db.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error counting marketplace data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const totalItems = countResults[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Then get paginated results
      db.query(query, (err, results) => {
        if (err) {
          console.error("Error fetching marketplace data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // if (results.length === 0) {
        //   return res.status(404).json({
        //     message: "No quotations or bids found in the marketplace.",
        //     pagination: {
        //       currentPage: parseInt(page),
        //       totalPages,
        //       totalItems,
        //       limit,
        //     },
        //   });
        // }

        const marketplace = results.reduce((acc, item) => {
          const { quotation_id, table_name, ...quotationData } = item;

          if (!acc[`${table_name}_${quotation_id}`]) {
            acc[`${table_name}_${quotation_id}`] = {
              quotation: {
                id: quotation_id,
                table_name,
                pickup_address: quotationData.pickup_address,
                delivery_address: quotationData.delivery_address,
                move_date: quotationData.move_date,
                service_type: quotationData.service_type,
                status: quotationData.status, // New status field (open or awarded)
                created_at: quotationData.quotation_created_at, // Tracks recent orders
              },
              bids: [],
            };
          }

          if (quotationData.bid_id) {
            acc[`${table_name}_${quotation_id}`].bids.push({
              bid_id: quotationData.bid_id,
              supplier_id: quotationData.supplier_id,
              bid_price: quotationData.bid_price,
              total_price: quotationData.total_price,
              additional_notes: quotationData.additional_notes,
              bid_created_at: quotationData.bid_created_at,
              bid_status: quotationData.bid_status,
            });
          }

          return acc;
        }, {});

        return res.status(200).json({
          message: "Marketplace data retrieved successfully.",
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            limit,
          },
          marketplace: Object.values(marketplace),
        });
      });
    });
  },
];

exports.viewQuotationDetails = [
  authenticateJWT,
  supplierIsLoggedIn,
  (req, res) => {
    const { table_name, id } = req.params;

    // ✅ List of valid quotation tables
    const validTables = [
      "estate_clearance",
      "evacuation_move",
      "secrecy_move",
      "private_move",
      "moving_cleaning",
      "heavy_lifting",
      "company_relocation",
    ];

    // ❌ Validate table name
    if (!validTables.includes(table_name)) {
      return res.status(400).json({ error: "Invalid quotation type" });
    }

    // ✅ Query to fetch full quotation details
    const query = `SELECT * FROM ${table_name} WHERE id = ?`;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error fetching quotation details:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Quotation not found" });
      }

      return res.status(200).json({
        message: "Quotation details retrieved successfully",
        quotation: results[0], // Return all fields from the quotation
      });
    });
  },
];

exports.getSupplierEarnings = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    try {
      const supplierId = req.user.id;

      // Query to fetch pending & completed earnings
      const earnings = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            SUM(CASE WHEN wr.status = 'completed' THEN ab.final_price ELSE 0 END) AS completed_earnings,
            COUNT(CASE WHEN wr.status = 'completed' THEN ab.id END) AS completed_transactions,
            SUM(CASE WHEN wr.id IS NULL AND ab.order_status = 'completed' THEN ab.final_price ELSE 0 END) AS pending_earnings,
            COUNT(CASE WHEN wr.id IS NULL AND ab.order_status = 'completed' THEN ab.id END) AS pending_transactions
          FROM accepted_bids ab
          LEFT JOIN withdrawal_requests wr ON wr.supplier_id = ab.supplier_id AND wr.status = 'completed'
          WHERE ab.supplier_id = ?;
        `;
        db.query(query, [supplierId], (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0 ? results[0] : {}); // Ensure it's an object
        });
      });

      // Query to fetch monthly earnings for completed transactions
      const monthlyEarnings = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            DATE_FORMAT(updated_at, '%Y-%m') AS month,
            SUM(final_price) AS monthly_earnings
          FROM accepted_bids
          WHERE supplier_id = ? AND order_status = 'completed'
          GROUP BY DATE_FORMAT(updated_at, '%Y-%m')
          ORDER BY month DESC;
        `;
        db.query(query, [supplierId], (err, results) => {
          if (err) return reject(err);
          resolve(results || []); // Ensure it's an array
        });
      });

      // Ensure earnings object has valid default values
      const response = {
        totalEarnings: {
          pending: earnings.pending_earnings || 0,
          completed: earnings.completed_earnings || 0,
        },
        totalTransactions: {
          pending: earnings.pending_transactions || 0,
          completed: earnings.completed_transactions || 0,
        },
        monthlyEarnings,
      };

      res.status(200).json({
        message: "Earnings fetched successfully.",
        data: response,
      });
    } catch (error) {
      console.error("Error fetching supplier earnings:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
];

exports.supplierDashboard = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { location, status, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
      // Fetch supplier details directly
      const [supplierDetails] = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            company_name,
            contact_person,
            email,
            phone,
            address,
            postal_code,
            city,
            organization_number,
            about_us
          FROM suppliers
          WHERE id = ?
        `;
        db.query(query, [supplier_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      const queryParams = [supplier_id];
      let additionalWhere = "";

      if (location) {
        additionalWhere += ` AND (
          CASE b.quotation_type
            WHEN 'company_relocation' THEN cr.delivery_address
            WHEN 'moving_cleaning' THEN mc.delivery_address
            WHEN 'heavy_lifting' THEN hl.delivery_address
            WHEN 'estate_clearance' THEN ec.delivery_address
            WHEN 'evacuation_move' THEN em.delivery_address
            WHEN 'private_move' THEN pm.delivery_address
            WHEN 'secrecy_move' THEN sm.delivery_address
          END LIKE ?
        )`;
        queryParams.push(`%${location}%`);
      }

      if (status) {
        additionalWhere += ` AND ab.order_status = ?`;
        queryParams.push(status);
      }

      // Count total orders
      const countQuery = `
        SELECT COUNT(*) as total
        FROM bids b
        LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
        LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
        LEFT JOIN moving_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'moving_cleaning'
        LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
        LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
        LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
        LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
        LEFT JOIN secrecy_move sm ON b.quotation_id = sm.id AND b.quotation_type = 'secrecy_move'
        WHERE b.supplier_id = ? ${additionalWhere}
      `;

      const [countResult] = await new Promise((resolve, reject) => {
        db.query(countQuery, queryParams, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      const totalItems = countResult.total;
      const totalPages = Math.ceil(totalItems / limit);

      // Fetch orders
      const orders = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            b.order_id,
            CASE b.quotation_type
              WHEN 'company_relocation' THEN cr.pickup_address
              WHEN 'moving_cleaning' THEN mc.pickup_address
              WHEN 'heavy_lifting' THEN hl.pickup_address
              WHEN 'estate_clearance' THEN ec.pickup_address
              WHEN 'evacuation_move' THEN em.pickup_address
              WHEN 'private_move' THEN pm.pickup_address
              WHEN 'secrecy_move' THEN sm.pickup_address
            END AS pickup_location,
            CASE b.quotation_type
              WHEN 'company_relocation' THEN cr.delivery_address
              WHEN 'moving_cleaning' THEN mc.delivery_address
              WHEN 'heavy_lifting' THEN hl.delivery_address
              WHEN 'estate_clearance' THEN ec.delivery_address
              WHEN 'evacuation_move' THEN em.delivery_address
              WHEN 'private_move' THEN pm.delivery_address
              WHEN 'secrecy_move' THEN sm.delivery_address
            END AS delivery_location,
            ab.order_status,
            b.created_at
          FROM bids b
          LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
          LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
          LEFT JOIN moving_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'moving_cleaning'
          LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
          LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
          LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
          LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
          LEFT JOIN secrecy_move sm ON b.quotation_id = sm.id AND b.quotation_type = 'secrecy_move'
          WHERE b.supplier_id = ? ${additionalWhere}
          ORDER BY b.created_at DESC
          LIMIT ? OFFSET ?
        `;
        db.query(query, [...queryParams, limit, offset], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      // Fetch disputes
      const disputes = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            d.id AS dispute_id,
            d.reason,
            d.status,
            d.updated_at,
            b.order_id
          FROM disputes d
          JOIN bids b ON d.bid_id = b.id
          WHERE d.against = ?
          ORDER BY d.updated_at DESC
        `;
        db.query(query, [supplier_id], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      return res.status(200).json({
        message: "Dashboard data fetched successfully",
        data: {
          supplier_id: supplier_id,
          supplier_details: supplierDetails,
          orders: orders.map((order) => ({
            order_id: order.order_id,
            pickup_location: order.pickup_location,
            delivery_location: order.delivery_location,
            order_status: order.order_status,
            created_at: new Date(order.created_at).toISOString(),
            updated_at: order.updated_at
              ? new Date(order.updated_at).toISOString()
              : null,
          })),
          disputes: disputes.map((dispute) => ({
            ...dispute,
            updated_at: dispute.updated_at
              ? new Date(dispute.updated_at).toISOString()
              : null,
          })),
          filters: {
            applied: {
              location: location || null,
              order_status: status || null,
            },
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch dashboard data",
      });
    }
  },
];

exports.getOrderById = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { order_id } = req.params;

    try {
      // Parse composite order ID
      const [quotation_type, quotation_id, bid_id] = order_id.split("-");

      const query = `
        SELECT 
          CONCAT(b.quotation_type, '-', b.quotation_id, '-', b.id) AS order_id,
          CASE b.quotation_type
            WHEN 'company_relocation' THEN cr.from_city
            WHEN 'move_out_cleaning' THEN mc.from_city
            WHEN 'storage' THEN st.from_city
            WHEN 'heavy_lifting' THEN hl.from_city
            WHEN 'carrying_assistance' THEN ca.from_city
            WHEN 'junk_removal' THEN jr.from_city
            WHEN 'estate_clearance' THEN ec.from_city
            WHEN 'evacuation_move' THEN em.from_city
            WHEN 'private_move' THEN pm.from_city
            WHEN 'local_move' THEN ms_local.from_city
            WHEN 'long_distance_move' THEN ms_long.from_city
            WHEN 'moving_abroad' THEN ms_abroad.from_city
          END AS pickup_location,
          CASE b.quotation_type
            WHEN 'company_relocation' THEN cr.to_city
            WHEN 'move_out_cleaning' THEN mc.to_city
            WHEN 'storage' THEN st.to_city
            WHEN 'heavy_lifting' THEN hl.to_city
            WHEN 'carrying_assistance' THEN ca.to_city
            WHEN 'junk_removal' THEN jr.to_city
            WHEN 'estate_clearance' THEN ec.to_city
            WHEN 'evacuation_move' THEN em.to_city
            WHEN 'private_move' THEN pm.to_city
            WHEN 'local_move' THEN ms_local.to_city
            WHEN 'long_distance_move' THEN ms_long.to_city
            WHEN 'moving_abroad' THEN ms_abroad.to_city
          END AS delivery_location,
          b.order_status,
          b.created_at,
          b.updated_at,
          b.bid_price,
          b.total_price,
          b.additional_notes,
          s.company_name,
          s.contact_person,
          s.email,
          s.phone,
          s.address,
          s.postal_code,
          s.city,
          s.organization_number
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
        LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'move_out_cleaning'
        LEFT JOIN storage st ON b.quotation_id = st.id AND b.quotation_type = 'storage'
        LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
        LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id AND b.quotation_type = 'carrying_assistance'
        LEFT JOIN junk_removal jr ON b.quotation_id = jr.id AND b.quotation_type = 'junk_removal'
        LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
        LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
        LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
        LEFT JOIN (
          SELECT id, to_city, from_city
          FROM moving_service
          WHERE JSON_CONTAINS(type_of_service, '"local_move"', '$')
        ) ms_local ON b.quotation_id = ms_local.id AND b.quotation_type = 'local_move'
        LEFT JOIN (
          SELECT id, to_city, from_city
          FROM moving_service
          WHERE JSON_CONTAINS(type_of_service, '"long_distance_move"', '$')
        ) ms_long ON b.quotation_id = ms_long.id AND b.quotation_type = 'long_distance_move'
        LEFT JOIN (
          SELECT id, to_city, from_city
          FROM moving_service
          WHERE JSON_CONTAINS(type_of_service, '"moving_abroad"', '$')
        ) ms_abroad ON b.quotation_id = ms_abroad.id AND b.quotation_type = 'moving_abroad'
        WHERE b.id = ? AND b.quotation_type = ? AND b.quotation_id = ? AND b.supplier_id = ?
      `;

      const [order] = await new Promise((resolve, reject) => {
        db.query(
          query,
          [bid_id, quotation_type, quotation_id, supplier_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.status(200).json({
        message: "Order details retrieved successfully",
        data: {
          order_details: {
            order_id: order.order_id,
            pickup_location: order.pickup_location,
            delivery_location: order.delivery_location,
            order_status: order.order_status,
            bid_price: order.bid_price,
            total_price: order.total_price,
            additional_notes: order.additional_notes,
            created_at: new Date(order.created_at).toISOString(),
            updated_at: order.updated_at
              ? new Date(order.updated_at).toISOString()
              : null,
          },
          supplier_details: {
            company_name: order.company_name,
            contact_person: order.contact_person,
            email: order.email,
            phone_number: order.phone,
            street_address: order.address,
            postal_code: order.postal_code,
            city: order.city,
            organization_number: order.organization_number,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch order details",
      });
    }
  },
];

exports.getDisputeById = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { dispute_id } = req.params;

    try {
      const query = `
      SELECT 
        d.*,
        b.quotation_id,
        b.quotation_type,
        b.order_id,
        b.status AS order_status,
        b.additional_services AS additional_notes,
        b.supplier_notes,
        b.supplier_id,
        sc.id AS chat_id,
        sc.message,
        sc.sender_type,
        sc.created_at AS message_created_at
      FROM disputes d
      JOIN bids b ON d.bid_id = b.id
      LEFT JOIN supplier_chats sc ON sc.dispute_id = d.id
        AND ((sc.sender_id = ? AND sc.sender_type = 'supplier') OR sc.sender_type = 'customer')
      WHERE d.id = ? AND d.against = ?
      ORDER BY sc.created_at ASC
    `;

      const results = await new Promise((resolve, reject) => {
        db.query(
          query,
          [supplier_id, dispute_id, supplier_id],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      if (!results.length) {
        return res.status(404).json({ error: "Dispute not found" });
      }

      const { quotation_id, quotation_type } = results[0];

      // Fetch quotation details
      const quotationQuery = `
        SELECT * FROM ${quotation_type} WHERE id = ?
      `;

      const [quotation] = await db
        .promise()
        .query(quotationQuery, [quotation_id]);

      if (!quotation.length) {
        return res.status(404).json({ error: "Quotation not found" });
      }

      const customerEmail = quotation[0].email;

      // Fetch customer ID
      const customerQuery = `SELECT id FROM customers WHERE email = ?`;
      const [customerResult] = await db
        .promise()
        .query(customerQuery, [customerEmail]);

      const customer_id = customerResult.length ? customerResult[0].id : null;

      // Group chat messages
      const chats = results
        .filter((row) => row.chat_id)
        .map((row) => ({
          chat_id: row.chat_id,
          message: row.message,
          sender_type: row.sender_type,
          created_at: new Date(row.message_created_at).toISOString(),
        }));

      return res.status(200).json({
        message: "Dispute details retrieved successfully",
        data: {
          dispute_details: {
            dispute_id: results[0].id,
            reason: results[0].reason,
            status: results[0].status,
            created_at: new Date(results[0].created_at).toISOString(),
            updated_at: results[0].updated_at
              ? new Date(results[0].updated_at).toISOString()
              : null,
          },
          order_details: {
            order_id: results[0].order_id,
            order_status: results[0].order_status,
            bid_price: results[0].bid_price,
            total_price: results[0].total_price,
            additional_notes: results[0].additional_notes,
          },
          quotation_details: quotation[0], // Include full quotation details
          customer_id, // Include customer ID
          chat_history: chats,
        },
      });
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch dispute details",
      });
    }
  },
];

exports.getQuotationById = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { quotation_type, quotation_id } = req.params;

    try {
      // Validate quotation type
      const allowedTypes = [
        "company_relocation",
        "move_out_cleaning",
        "storage",
        "heavy_lifting",
        "carrying_assistance",
        "junk_removal",
        "estate_clearance",
        "evacuation_move",
        "private_move",
        "local_move",
        "long_distance_move",
        "moving_abroad",
      ];

      if (!allowedTypes.includes(quotation_type)) {
        return res.status(400).json({ error: "Invalid quotation type" });
      }

      let query;
      let queryParams;

      if (
        ["local_move", "long_distance_move", "moving_abroad"].includes(
          quotation_type
        )
      ) {
        query = `
          SELECT 
            ms.*,
            b.id AS bid_id,
            b.bid_price,
            b.total_price,
            b.additional_notes,
            b.created_at AS bid_created_at,
            b.status AS bid_status
          FROM moving_service ms
          LEFT JOIN bids b ON b.quotation_id = ms.id 
            AND b.quotation_type = ? 
            AND b.supplier_id = ?
          WHERE ms.id = ?
            AND JSON_CONTAINS(ms.type_of_service, ?, '$')
        `;
        queryParams = [
          quotation_type,
          supplier_id,
          quotation_id,
          `"${quotation_type}"`,
        ];
      } else {
        query = `
          SELECT 
            q.*,
            b.id AS bid_id,
            b.bid_price,
            b.total_price,
            b.additional_notes,
            b.created_at AS bid_created_at,
            b.status AS bid_status
          FROM ${quotation_type} q
          LEFT JOIN bids b ON b.quotation_id = q.id 
            AND b.quotation_type = ?
            AND b.supplier_id = ?
          WHERE q.id = ?
        `;
        queryParams = [quotation_type, supplier_id, quotation_id];
      }

      const [quotation] = await new Promise((resolve, reject) => {
        db.query(query, queryParams, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (!quotation) {
        return res.status(404).json({ error: "Quotation not found" });
      }

      return res.status(200).json({
        message: "Quotation details retrieved successfully",
        data: {
          quotation_details: {
            id: quotation.id,
            from_city: quotation.from_city,
            to_city: quotation.to_city,
            move_date: quotation.move_date,
            type_of_service: quotation.type_of_service,
            status: quotation.status,
            created_at: new Date(quotation.created_at).toISOString(),
          },
          bid_details: quotation.bid_id
            ? {
                bid_id: quotation.bid_id,
                bid_price: quotation.bid_price,
                total_price: quotation.total_price,
                additional_notes: quotation.additional_notes,
                bid_status: quotation.bid_status,
                created_at: new Date(quotation.bid_created_at).toISOString(),
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Error fetching quotation details:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch quotation details",
      });
    }
  },
];

// logging out
exports.supplierLogout = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    try {
      // Ensure admin is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      // Clear the JWT from cookies
      res.clearCookie("supplier_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({ message: "Supplier logout successful!" });
    } catch (error) {
      console.error("Error logging out admin:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to log out Supplier.",
      });
    }
  },
];

exports.getSupplierBids = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const supplier_id = req.user.id;
    const { page = 1, status, date_from, date_to } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
      let whereClause = "WHERE b.supplier_id = ?";
      const queryParams = [supplier_id];

      if (status) {
        whereClause += " AND b.status = ?";
        queryParams.push(status);
      }

      if (date_from) {
        whereClause += " AND b.created_at >= ?";
        queryParams.push(date_from);
      }
      if (date_to) {
        whereClause += " AND b.created_at <= ?";
        queryParams.push(date_to);
      }

      // Count total bids
      const [countResult] = await new Promise((resolve, reject) => {
        const countQuery = `
          SELECT COUNT(*) as total
          FROM bids b
          ${whereClause}
        `;
        db.query(countQuery, queryParams, (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      const totalItems = countResult.total;
      const totalPages = Math.ceil(totalItems / limit);

      // Fetch bids with quotation details
      const bids = await new Promise((resolve, reject) => {
        const query = `
          SELECT 
            b.id as bid_id,
            b.order_id,
            b.quotation_type,
            b.quotation_id,
            b.moving_cost,
            b.supplier_notes,
            b.status as bid_status,
            b.created_at as bid_created_at,
            ab.final_price,
            ab.order_status,
            ab.delivery_status,
            IF(ab.assignedDriverId IS NOT NULL AND ab.assignedDriverId != 0, true, false) as is_assigned,
            CASE b.quotation_type
              WHEN 'company_relocation' THEN cr.pickup_address
              WHEN 'moving_cleaning' THEN mc.pickup_address
              WHEN 'heavy_lifting' THEN hl.pickup_address
              WHEN 'estate_clearance' THEN ec.pickup_address
              WHEN 'evacuation_move' THEN em.pickup_address
              WHEN 'private_move' THEN pm.pickup_address
              WHEN 'secrecy_move' THEN sm.pickup_address
            END AS from_city,
            CASE b.quotation_type
              WHEN 'company_relocation' THEN cr.delivery_address
              WHEN 'moving_cleaning' THEN mc.delivery_address
              WHEN 'heavy_lifting' THEN hl.delivery_address
              WHEN 'estate_clearance' THEN ec.delivery_address
              WHEN 'evacuation_move' THEN em.delivery_address
              WHEN 'private_move' THEN pm.delivery_address
              WHEN 'secrecy_move' THEN sm.delivery_address
            END AS to_city,
            CASE b.quotation_type
              WHEN 'company_relocation' THEN cr.date
              WHEN 'moving_cleaning' THEN mc.date
              WHEN 'heavy_lifting' THEN hl.date
              WHEN 'estate_clearance' THEN ec.date
              WHEN 'evacuation_move' THEN em.date
              WHEN 'private_move' THEN pm.date
              WHEN 'secrecy_move' THEN sm.date
            END AS move_date,
            CASE b.quotation_type
              WHEN 'company_relocation' THEN cr.distance
              WHEN 'moving_cleaning' THEN mc.distance
              WHEN 'heavy_lifting' THEN hl.distance
              WHEN 'estate_clearance' THEN ec.distance
              WHEN 'evacuation_move' THEN em.distance
              WHEN 'private_move' THEN pm.distance
              WHEN 'secrecy_move' THEN sm.distance
            END AS distance
          FROM bids b
          LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
          LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
          LEFT JOIN moving_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'moving_cleaning'
          LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
          LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
          LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
          LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
          LEFT JOIN secrecy_move sm ON b.quotation_id = sm.id AND b.quotation_type = 'secrecy_move'
          ${whereClause}
          ORDER BY b.created_at DESC
          LIMIT ? OFFSET ?
        `;

        db.query(query, [...queryParams, limit, offset], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      return res.status(200).json({
        message: "Supplier bids retrieved successfully",
        data: {
          bids: bids.map((bid) => ({
            bid_id: bid.bid_id,
            order_id: bid.order_id,
            quotation_type: bid.quotation_type,
            quotation_id: bid.quotation_id,
            moving_cost: bid.moving_cost,
            final_price: bid.final_price,
            supplier_notes: bid.supplier_notes,
            bid_status: bid.bid_status,
            order_status: bid.order_status,
            is_assigned: bid.is_assigned,
            from_city: bid.from_city,
            to_city: bid.to_city,
            move_date: bid.move_date,
            distance: bid.distance || 0,
            created_at: new Date(bid.bid_created_at).toISOString(),
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching supplier bids:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to fetch supplier bids",
      });
    }
  },
];