const db = require("../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../utils/notificationService");
const emailService = require("../../utils/emailService");
const { format, differenceInCalendarMonths, addMonths } = require("date-fns");
const path = require("path");
const fs = require("fs");
const { check, validationResult } = require("express-validator");

const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

// Admin login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Both username and password are required." });
  }

  try {
    const query = `
      SELECT id, username, password, role, firstname, lastname, phone_number
      FROM admin 
      WHERE username = ?
    `;

    const [results] = await db.promise().query(query, [username]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Invalid username or password." });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Save admin info in the session
    req.admin = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      fullname: admin.firstname + " " + admin.lastname,
      phonenumber: admin.phone_number,
    };

    await logAdminActivity(
      req,
      admin.id,
      "LOGIN",
      `Admin ${admin.username} logged in successfully`
    );

    return res.status(200).json({
      message: "Login successful!",
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        fullname: admin.firstname + " " + admin.lastname,
        phonenumber: admin.phone_number,
      },
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create new admin (Super admin only)
exports.createAdmin = [
  checkRole(["super_admin"]),
  async (req, res) => {
    const {
      username,
      password,
      role,
      firstname,
      lastname,
      phone_number,
      email,
    } = req.body;

    if (
      !username ||
      !password ||
      !role ||
      !firstname ||
      !lastname ||
      !phone_number ||
      !email
    ) {
      return res.status(400).json({
        error:
          "Username, password, role, firstname, lastname, email, and phone number are required.",
      });
    }

    if (!["super_admin", "support_admin", "finance_admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role specified.",
      });
    }

    try {
      // Check if username already exists
      const [existingAdmin] = await db
        .promise()
        .query("SELECT id FROM admin WHERE username = ?", [username]);

      if (existingAdmin.length > 0) {
        return res.status(409).json({
          error: "Username already exists",
          message: `The username '${username}' is already taken. Please choose a different username.`,
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO admin (username, password, role, firstname, lastname, phone_number, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db
        .promise()
        .query(query, [
          username,
          hashedPassword,
          role,
          firstname,
          lastname,
          phone_number,
          email,
        ]);

      await logAdminActivity(
        req,
        req.admin.id,
        "CREATE_ADMIN",
        `Created new admin account for ${username} with role ${role}`,
        result.insertId,
        "create admin"
      );

      res.status(201).json({
        message: "Admin created successfully",
        admin: {
          id: result.insertId,
          username,
          role,
          firstname,
          lastname,
          phone_number,
          email,
        },
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "An error occurred while creating the admin account.",
      });
    }
  },
];

// Get all quotations (all admins)
exports.getAllQuotations = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const {
      type,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const offset = (page - 1) * limit;

    // Define correct table queries
    const quotationTables = {
      company_relocation: "company_relocation",
      moving_cleaning: "moving_cleaning",
      heavy_lifting: "heavy_lifting",
      estate_clearance: "estate_clearance",
      evacuation_move: "evacuation_move",
      private_move: "private_move",
      secrecy_move: "secrecy_move",
    };

    let queries = [];
    let queryParams = [];

    // Base WHERE conditions
    let whereClauses = [];

    if (status) {
      whereClauses.push("status = ?");
      queryParams.push(status);
    }
    if (startDate) {
      whereClauses.push("created_at >= ?");
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClauses.push("created_at <= ?");
      queryParams.push(endDate);
    }
    if (search) {
      whereClauses.push(
        "(pickup_address LIKE ? OR delivery_address LIKE ? OR name LIKE ? OR ssn LIKE ?)"
      );
      queryParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    // Convert WHERE clauses into a query condition
    const whereCondition = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    try {
      if (type && quotationTables[type]) {
        // Query a specific quotation type
        queries.push(
          `SELECT *, '${type}' AS quotation_type FROM ${quotationTables[type]} ${whereCondition} LIMIT ? OFFSET ?`
        );
      } else {
        // Query all quotations
        Object.entries(quotationTables).forEach(([key, table]) => {
          queries.push(
            `SELECT *, '${key}' AS quotation_type FROM ${table} ${whereCondition} LIMIT ? OFFSET ?`
          );
        });
      }

      // Execute the queries
      const results = [];
      const totalCountPromises = [];

      await Promise.all(
        queries.map(async (query) => {
          const [rows] = await db
            .promise()
            .query(query, [...queryParams, parseInt(limit), parseInt(offset)]);
          results.push(...rows);
        })
      );

      // Fetch total count of quotations
      const countQueries = queries.map(
        (query) =>
          `SELECT COUNT(*) AS total FROM (${query.replace(
            "LIMIT ? OFFSET ?",
            ""
          )}) AS subquery`
      );
      await Promise.all(
        countQueries.map(async (countQuery) => {
          const [[{ total }]] = await db
            .promise()
            .query(countQuery, queryParams);
          totalCountPromises.push(total);
        })
      );

      const totalRecords = totalCountPromises.reduce(
        (acc, count) => acc + count,
        0
      );

      // Sort results by `created_at`
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Paginate results
      const paginatedResults = results.slice(0, limit);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_QUOTATIONS",
        `Viewed all quotations with filters: ${JSON.stringify({
          type,
          status,
          startDate,
          endDate,
          search,
        })}`
      );

      return res.status(200).json({
        message: "Quotations fetched successfully!",
        total: totalRecords,
        page: parseInt(page),
        limit: parseInt(limit),
        data: paginatedResults,
      });
    } catch (err) {
      console.error("Error fetching quotations:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error: Unable to fetch data." });
    }
  },
];

exports.getQuotationById = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { type, id } = req.params;

    try {
      let query;
      const queryParams = [id];
      const isMovingService = [
        "local_move",
        "long_distance_move",
        "moving_abroad",
      ].includes(type);

      if (isMovingService) {
        query = `
          SELECT 
            *,
            ? as type
          FROM moving_service 
          WHERE id = ? 
          AND JSON_CONTAINS(type_of_service, ?, '$')
        `;
        queryParams.unshift(type); // Add type as first parameter
        queryParams.push(`"${type}"`); // Add type for JSON_CONTAINS
      } else {
        // Validate type against allowed service types
        const allowedTypes = [
          "company_relocation",
          "moving_cleaning",
          "storage",
          "heavy_lifting",
          "carrying_assistance",
          "junk_removal",
          "estate_clearance",
          "evacuation_move",
          "private_move",
          "secrecy_move",
        ];

        if (!allowedTypes.includes(type)) {
          return res.status(400).json({
            error: "Invalid quotation type",
          });
        }

        query = `
          SELECT 
            *,
            ? as type
          FROM ${type}
          WHERE id = ?
        `;
        queryParams.unshift(type); // Add type as first parameter
      }

      const [results] = await db.promise().query(query, queryParams);
      const quotation = results[0];

      if (!quotation) {
        return res.status(404).json({
          error: "Quotation not found",
        });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_QUOTATION",
        `Viewed quotation details for ${type} #${id}`,
        id,
        type
      );

      res.status(200).json({
        message: "Quotation fetched successfully!",
        data: quotation,
      });
    } catch (error) {
      console.error("Error fetching quotation:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch quotation",
      });
    }
  },
];

// get quotations by id
exports.getQuotationByIdWithBid = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { type, id } = req.params;

    try {
      let quotationQuery, bidsQuery;
      const queryParams = [id];
      const isMovingService = [
        "local_move",
        "long_distance_move",
        "moving_abroad",
      ].includes(type);

      if (isMovingService) {
        quotationQuery = `
          SELECT 
            *,
            ? as type
          FROM moving_service 
          WHERE id = ? 
          AND JSON_CONTAINS(type_of_service, ?, '$')
        `;
        queryParams.unshift(type);
        queryParams.push(`"${type}"`);

        bidsQuery = `
          SELECT 
            b.*,
            s.company_name AS supplier_name
          FROM bids b
          LEFT JOIN suppliers s ON b.supplier_id = s.id
          WHERE b.quotation_id = ?
          AND b.quotation_type = ?
          ORDER BY b.created_at DESC
        `;
      } else {
        const allowedTypes = [
          "company_relocation",
          "moving_cleaning",
          "heavy_lifting",
          "estate_clearance",
          "evacuation_move",
          "private_move",
          "secrecy_move",
        ];

        if (!allowedTypes.includes(type)) {
          return res.status(400).json({
            error: "Invalid quotation type",
          });
        }

        quotationQuery = `
          SELECT 
            *,
            ? as type
          FROM ${type}
          WHERE id = ?
        `;
        queryParams.unshift(type);

        bidsQuery = `
          SELECT 
            b.*,
            s.company_name AS supplier_name
          FROM bids b
          LEFT JOIN suppliers s ON b.supplier_id = s.id
          WHERE b.quotation_id = ?
          AND b.quotation_type = ?
          ORDER BY b.created_at DESC
        `;
      }

      // Get quotation details
      const [quotationResults] = await db
        .promise()
        .query(quotationQuery, queryParams);
      const quotation = quotationResults[0];

      if (!quotation) {
        return res.status(404).json({
          error: "Quotation not found",
        });
      }

      // Get associated bids
      const [bids] = await db.promise().query(bidsQuery, [id, type]);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_QUOTATION_WITH_BIDS",
        `Viewed quotation and bids for ${type} #${id}`,
        id,
        type
      );

      res.status(200).json({
        message: "Quotation and bids fetched successfully!",
        data: {
          quotation,
          bids,
        },
      });
    } catch (error) {
      console.error("Error fetching quotation and bids:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch data",
      });
    }
  },
];

// search for the quotation using id and location
exports.searchQuotations = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { search, page = 1, limit = 20 } = req.body;

    if (!search || search.trim() === "") {
      return res.status(400).json({ error: "Search input is required." });
    }

    const searchInput = `%${search.trim()}%`;

    try {
      // Define queries for all quotation tables
      const queries = {
        companyRelocation: `
          SELECT *, 'company_relocation' AS type 
          FROM company_relocation
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        moveOutCleaning: `
          SELECT *, 'move_out_cleaning' AS type 
          FROM move_out_cleaning
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        storage: `
          SELECT *, 'storage' AS type 
          FROM storage
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        heavyLifting: `
          SELECT *, 'heavy_lifting' AS type 
          FROM heavy_lifting
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        carryingAssistance: `
          SELECT *, 'carrying_assistance' AS type 
          FROM carrying_assistance
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        junkRemoval: `
          SELECT *, 'junk_removal' AS type 
          FROM junk_removal
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        estateClearance: `
          SELECT *, 'estate_clearance' AS type 
          FROM estate_clearance
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        evacuationMove: `
          SELECT *, 'evacuation_move' AS type 
          FROM evacuation_move
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
        privacyMove: `
          SELECT *, 'private_move' AS type 
          FROM private_move
          WHERE id LIKE ? OR from_city LIKE ? OR to_city LIKE ?
        `,
      };

      // Execute count queries to get the total number of records
      const countQueries = Object.entries(queries).reduce(
        (acc, [key, query]) => ({
          ...acc,
          [key]: `SELECT COUNT(*) AS count FROM (${query}) AS subquery`,
        }),
        {}
      );

      const totalCounts = await Promise.all(
        Object.entries(countQueries).map(([key, query]) => {
          return new Promise((resolve, reject) => {
            db.query(
              query,
              [searchInput, searchInput, searchInput],
              (err, rows) => {
                if (err) {
                  console.error(`Error fetching count from ${key}:`, err);
                  return reject(err);
                }
                resolve(rows[0].count);
              }
            );
          });
        })
      );

      const totalRecords = totalCounts.reduce((acc, count) => acc + count, 0);
      const totalPages = Math.ceil(totalRecords / limit);

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Execute paginated queries
      const results = [];
      await Promise.all(
        Object.entries(queries).map(([key, query]) => {
          return new Promise((resolve, reject) => {
            const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
            db.query(
              paginatedQuery,
              [
                searchInput,
                searchInput,
                searchInput,
                parseInt(limit),
                parseInt(offset),
              ],
              (err, rows) => {
                if (err) {
                  console.error(`Error fetching data from ${key}:`, err);
                  return reject(err);
                }
                results.push(...rows); // Append the results to a single array
                resolve();
              }
            );
          });
        })
      );

      // Sort results by created_at
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      await logAdminActivity(
        req,
        req.admin.id,
        "SEARCH_QUOTATIONS",
        `Searched quotations with term: "${search}"`,
        null,
        "search"
      );

      // Respond with the search results
      return res.status(200).json({
        message: "Search completed successfully!",
        total: totalRecords,
        totalPages: totalPages,
        page: parseInt(page),
        limit: parseInt(limit),
        data: results,
      });
    } catch (err) {
      console.error("Error executing search:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error: Unable to execute search." });
    }
  },
];

// Delete a quotation by type and ID (All admin roles)
exports.deleteQuotation = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { type, id } = req.params;
    if (!type || !id) {
      return res
        .status(400)
        .json({ error: "Quotation type and ID are required." });
    }

    // List of allowed types/tables
    const allowedTypes = [
      "company_relocation",
      "moving_cleaning",
      "heavy_lifting",
      "estate_clearance",
      "evacuation_move",
      "private_move",
      "secrecy_move",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid quotation type." });
    }

    try {
      // Check if the quotation exists
      const [quotation] = await db
        .promise()
        .query(`SELECT id FROM ${type} WHERE id = ?`, [id]);
      if (!quotation.length) {
        return res.status(404).json({ error: "Quotation not found." });
      }

      // Delete the quotation
      const [result] = await db
        .promise()
        .query(`DELETE FROM ${type} WHERE id = ?`, [id]);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Quotation could not be deleted." });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "DELETE_QUOTATION",
        `Deleted quotation of type ${type} with ID ${id}`,
        id,
        type
      );

      return res
        .status(200)
        .json({ message: `Quotation with ID ${id} deleted successfully.` });
    } catch (error) {
      console.error("Error deleting quotation:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error: Unable to delete quotation." });
    }
  },
];

// get recent admin activities (Super admin, Support admin, Finance admin)
exports.getRecentAdminActivities = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      const query = `
        SELECT 
          title, 
          message, 
          type, 
          reference_id, 
          reference_type, 
          created_at 
        FROM notifications 
        WHERE recipient_type = 'admin' 
        ORDER BY created_at DESC 
        LIMIT 5
      `;

      const [activities] = await db.promise().query(query);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_RECENT_ACTIVITIES",
        "Viewed recent admin activities",
        null,
        "activity_log"
      );

      res.status(200).json({
        message: "Recent admin activities fetched successfully!",
        activities,
      });
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Unable to fetch recent activities.",
      });
    }
  },
];

// Get all bids (All admin roles)
exports.allBids = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT 
        b.id AS bid_id,
        b.order_id,
        b.quotation_type,
        b.supplier_id,
        s.company_name AS supplier_name,
        b.moving_cost,
        b.status AS bid_status,
        b.created_at AS bid_created_at,
        ab.final_price,
        bp.initial_payment_date,
        bp.remaining_payment_date
      FROM bids b
      LEFT JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
      LEFT JOIN bid_payments bp ON b.id = bp.bid_id
      WHERE 1 = 1
    `;

    // Add filters dynamically
    const queryParams = [];

    if (search) {
      query += ` AND (
        b.id LIKE ? OR
        b.quotation_type LIKE ? OR
        b.status LIKE ? OR
        s.company_name LIKE ?
      )`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status) {
      query += ` AND b.status = ?`;
      queryParams.push(status);
    }
    if (startDate) {
      query += ` AND b.created_at >= ?`;
      queryParams.push(startDate);
    }
    if (endDate) {
      query += ` AND b.created_at <= ?`;
      queryParams.push(endDate);
    }

    // Separate base query for counting total results
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM bids b
      LEFT JOIN suppliers s ON b.supplier_id = s.id
      LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
      LEFT JOIN bid_payments bp ON b.id = bp.bid_id
      WHERE 1 = 1
      ${query.split("WHERE 1 = 1")[1].split("LIMIT")[0]}
    `;

    // commented out the sorting by payment status
    // WHEN ab.payment_status = 'paid' THEN 0
    //       WHEN ab.payment_status = 'awaiting_initial_payment' THEN 1
    //       WHEN ab.payment_status = 'initial_paid' THEN 2
    //       WHEN ab.payment_status = 'awaiting_remaining_payment' THEN 3
    //       WHEN ab.payment_status = 'failed' THEN 4
    //       ELSE 5

    // Add sorting and pagination
    query += ` 
      ORDER BY 
        CASE 
          WHEN b.status = 'pending' THEN 0
          ELSE 1
        END,
        b.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    queryParams.push(Number(limit), Number(offset));

    try {
      // Execute count query
      const [countResults] = await db
        .promise()
        .query(countQuery, queryParams.slice(0, -2));
      const total = countResults[0].total;

      // Execute main query
      const [rows] = await db.promise().query(query, queryParams);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_ALL_BIDS",
        `Viewed all bids with filters: ${JSON.stringify({
          status,
          startDate,
          endDate,
          search,
        })}`,
        null,
        "bids"
      );

      res.status(200).json({
        message: "Bids fetched successfully!",
        total: Number(total || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total || 0) / limit),
        data: rows.map((row) => ({ ...row, type: "bid" })),
      });
    } catch (error) {
      console.error("Error fetching bids:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Unable to fetch bids." });
    }
  },
];

// get bids by id
exports.getBidById = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Fetch main bid details
      const query = `
        SELECT 
          b.id AS bid_id,
          b.order_id,
          b.quotation_type,
          b.quotation_id,
          b.supplier_id,
          s.company_name AS supplier_name,
          s.phone AS supplier_phone,
          s.email AS supplier_email,
          s.address AS supplier_address,
          q.file_paths AS quotation_files,
          q.email AS customer_email,
          q.distance,  -- Added distance from the quotation
          b.moving_cost,
          b.truck_cost,
          b.additional_services,
          b.status AS bid_status,
          b.created_at AS bid_created_at,
          ab.final_price,
          bp.initial_payment_date,
          bp.remaining_payment_date,
          c.payment_status,  -- Added payment_status from checkout
          c.total_price      -- Added total_price from checkout
        FROM bids b
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
        LEFT JOIN bid_payments bp ON b.id = bp.bid_id
        LEFT JOIN checkout c ON b.order_id = c.order_id  -- Fetch payment details from checkout
        INNER JOIN (
          SELECT id, 'private_move' AS type, email, file_paths, distance FROM private_move
          UNION ALL
          SELECT id, 'moving_cleaning' AS type, email, file_paths, distance FROM moving_cleaning
          UNION ALL
          SELECT id, 'heavy_lifting' AS type, email, file_paths, distance FROM heavy_lifting
          UNION ALL
          SELECT id, 'company_relocation' AS type, email, file_paths, distance FROM company_relocation
          UNION ALL
          SELECT id, 'estate_clearance' AS type, email, file_paths, distance FROM estate_clearance
          UNION ALL
          SELECT id, 'evacuation_move' AS type, email, file_paths, distance FROM evacuation_move
          UNION ALL
          SELECT id, 'secrecy_move' AS type, email, file_paths, distance FROM secrecy_move
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.type
        WHERE b.id = ?
      `;

      const [bidResults] = await db.promise().query(query, [id]);
      const bid = bidResults[0];

      if (!bid) {
        return res.status(404).json({ error: "Bid not found" });
      }

      // Fetch supplier rating separately
      const ratingQuery = `
        SELECT 
          COALESCE(AVG(rating), 0) AS avg_rating, 
          COUNT(*) AS total_reviews 
        FROM reviews 
        WHERE supplier_id = ?;
      `;

      const [ratingResults] = await db
        .promise()
        .query(ratingQuery, [bid.supplier_id]);
      const { avg_rating, total_reviews } = ratingResults[0];

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_BID_DETAILS",
        `Viewed bid details for #${id}`,
        id,
        "bid"
      );

      res.status(200).json({
        message: "Bid fetched successfully!",
        data: {
          ...bid,
          avg_rating: parseFloat(avg_rating).toFixed(2), // Ensure formatted rating
          total_reviews: total_reviews || 0, // Default to 0 if no reviews
          type: "bid",
        },
      });
    } catch (error) {
      console.error("Error fetching bid:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch bid.",
      });
    }
  },
];

// search bids
exports.searchBids = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { search } = req.body; // Single search input
    const { page = 1, limit = 20 } = req.query; // Pagination parameters

    if (!search || search.trim() === "") {
      return res.status(400).json({ error: "Search input is required." });
    }

    const searchInput = `%${search.trim()}%`;
    const offset = (page - 1) * limit;

    try {
      // Query to fetch matching bids
      const searchQuery = `
        SELECT 
          b.id AS bid_id,
          b.order_id,
          b.quotation_type,
          b.supplier_id,
          s.company_name AS supplier_name,
          s.email AS supplier_email,
          b.moving_cost,
          b.status AS bid_status,
          b.created_at AS bid_created_at,
          ab.final_price,
          bp.initial_payment_date,
          bp.remaining_payment_date,
          'bid' AS type
        FROM bids b
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
        LEFT JOIN bid_payments bp ON b.id = bp.bid_id
        WHERE 
          LOWER(b.id) LIKE LOWER(?) OR
          LOWER(b.order_id) LIKE LOWER(?) OR
          LOWER(b.quotation_type) LIKE LOWER(?) OR
          LOWER(s.company_name) LIKE LOWER(?) OR
          LOWER(s.email) LIKE LOWER(?) OR
          b.moving_cost LIKE ?
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `;

      // Query to count total matching records
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM bids b
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        WHERE 
          LOWER(b.id) LIKE LOWER(?) OR
          LOWER(b.order_id) LIKE LOWER(?) OR
          LOWER(b.quotation_type) LIKE LOWER(?) OR
          LOWER(s.company_name) LIKE LOWER(?) OR
          LOWER(s.email) LIKE LOWER(?) OR
          b.moving_cost LIKE ?
      `;

      // Execute the queries
      const [bids] = await db
        .promise()
        .query(searchQuery, [
          searchInput,
          searchInput,
          searchInput,
          searchInput,
          searchInput,
          searchInput,
          parseInt(limit),
          parseInt(offset),
        ]);

      const [countResults] = await db
        .promise()
        .query(countQuery, [
          searchInput,
          searchInput,
          searchInput,
          searchInput,
          searchInput,
          searchInput,
        ]);

      const total = countResults[0].total;

      await logAdminActivity(
        req,
        req.admin.id,
        "SEARCH_BIDS",
        `Searched bids with term: "${search}"`,
        null,
        "search"
      );

      // Respond with paginated results
      res.status(200).json({
        message: "Search completed successfully!",
        total, // Total matching records
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit), // Total pages
        data: bids,
      });
    } catch (error) {
      console.error("Error executing bid search:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to execute search.",
      });
    }
  },
];

// get all bids and quotations (all admin)
exports.fetchQuotationsAndBids = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Queries for fetching quotations (corrected table names)
      const quotationQueries = {
        privacyMove: `SELECT * FROM private_move LIMIT ? OFFSET ?`,
        movingCleaning: `SELECT * FROM moving_cleaning LIMIT ? OFFSET ?`,
        heavyLifting: `SELECT * FROM heavy_lifting LIMIT ? OFFSET ?`,
        companyRelocation: `SELECT * FROM company_relocation LIMIT ? OFFSET ?`,
        estateClearance: `SELECT * FROM estate_clearance LIMIT ? OFFSET ?`,
        evacuationMove: `SELECT * FROM evacuation_move LIMIT ? OFFSET ?`,
        secrecyMove: `SELECT * FROM secrecy_move LIMIT ? OFFSET ?`,
      };

      // Fetch all quotations
      const quotationResults = {};
      const quotationPromises = Object.entries(quotationQueries).map(
        async ([key, query]) => {
          const [rows] = await db
            .promise()
            .query(query, [parseInt(limit), parseInt(offset)]);
          quotationResults[key] = rows;
        }
      );

      // Query to fetch all bids with supplier and payment details
      const bidsQuery = `
        SELECT 
          b.id AS bid_id,
          b.order_id,
          b.quotation_type,
          b.quotation_id,
          b.supplier_id,
          s.company_name AS supplier_name,
          b.moving_cost,
          b.status AS bid_status,
          b.created_at AS bid_created_at,
          ab.final_price,
          bp.initial_payment_date,
          bp.remaining_payment_date
        FROM bids b
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
        LEFT JOIN bid_payments bp ON b.id = bp.bid_id
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `;

      // Fetch bids
      const [bids] = await db
        .promise()
        .query(bidsQuery, [parseInt(limit), parseInt(offset)]);

      // Fetch quotation details and customer IDs for each bid
      const bidPromises = bids.map(async (bid) => {
        const { quotation_type, quotation_id } = bid;

        if (!quotation_type || !quotation_id) {
          return { ...bid, quotation_details: null, customer_id: null };
        }

        // Fetch quotation from the respective table
        const quotationQuery = `SELECT * FROM ${quotation_type} WHERE id = ?`;
        const [quotationResult] = await db
          .promise()
          .query(quotationQuery, [quotation_id]);

        if (!quotationResult.length) {
          return { ...bid, quotation_details: null, customer_id: null };
        }

        const quotation = quotationResult[0];

        // Fetch customer ID using email
        const customerQuery = `SELECT id FROM customers WHERE email = ?`;
        const [customerResult] = await db
          .promise()
          .query(customerQuery, [quotation.email]);

        const customer_id = customerResult.length ? customerResult[0].id : null;

        return { ...bid, quotation_details: quotation, customer_id };
      });

      // Resolve all bid-related promises
      const enhancedBids = await Promise.all(bidPromises);

      // Execute all quotation queries in parallel
      await Promise.all(quotationPromises);

      // Respond with fetched data
      res.status(200).json({
        message: "Quotations and bids fetched successfully!",
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
        data: {
          quotations: quotationResults,
          bids: enhancedBids,
        },
      });
    } catch (error) {
      console.error("Error fetching quotations and bids:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch data.",
      });
    }
  },
];

// literal counts of all bids, quotation, dispute
exports.getTotalCounts = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      const countQueries = {
        conversations: `SELECT COUNT(*) AS total FROM conversations`,

        bids: `
          SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
          FROM bids
        `,

        quotations: `
          WITH all_counts AS (
            SELECT COUNT(*) as cnt FROM private_move
            UNION ALL
            SELECT COUNT(*) FROM moving_cleaning
            UNION ALL
            SELECT COUNT(*) FROM heavy_lifting
            UNION ALL
            SELECT COUNT(*) FROM company_relocation
            UNION ALL
            SELECT COUNT(*) FROM estate_clearance
            UNION ALL
            SELECT COUNT(*) FROM evacuation_move
            UNION ALL
            SELECT COUNT(*) FROM secrecy_move
          ),
          awarded_counts AS (
            SELECT COUNT(*) as cnt FROM private_move WHERE status = 'awarded'
            UNION ALL
            SELECT COUNT(*) FROM moving_cleaning WHERE status = 'awarded'
            UNION ALL
            SELECT COUNT(*) FROM heavy_lifting WHERE status = 'awarded'
            UNION ALL
            SELECT COUNT(*) FROM company_relocation WHERE status = 'awarded'
            UNION ALL
            SELECT COUNT(*) FROM estate_clearance WHERE status = 'awarded'
            UNION ALL
            SELECT COUNT(*) FROM evacuation_move WHERE status = 'awarded'
            UNION ALL
            SELECT COUNT(*) FROM secrecy_move WHERE status = 'awarded'
          ),
          open_counts AS (
            SELECT COUNT(*) as cnt FROM private_move WHERE status = 'open'
            UNION ALL
            SELECT COUNT(*) FROM moving_cleaning WHERE status = 'open'
            UNION ALL
            SELECT COUNT(*) FROM heavy_lifting WHERE status = 'open'
            UNION ALL
            SELECT COUNT(*) FROM company_relocation WHERE status = 'open'
            UNION ALL
            SELECT COUNT(*) FROM estate_clearance WHERE status = 'open'
            UNION ALL
            SELECT COUNT(*) FROM evacuation_move WHERE status = 'open'
            UNION ALL
            SELECT COUNT(*) FROM secrecy_move WHERE status = 'open'
          )
          SELECT 
            SUM(cnt) AS total,
            (SELECT SUM(cnt) FROM awarded_counts) AS awarded,
            (SELECT SUM(cnt) FROM open_counts) AS open
          FROM all_counts
        `,

        quotationsAndBids: `
          SELECT 
            (
              SELECT SUM(cnt) FROM (
                SELECT COUNT(*) as cnt FROM private_move
                UNION ALL
                SELECT COUNT(*) FROM moving_cleaning
                UNION ALL
                SELECT COUNT(*) FROM heavy_lifting
                UNION ALL
                SELECT COUNT(*) FROM company_relocation
                UNION ALL
                SELECT COUNT(*) FROM estate_clearance
                UNION ALL
                SELECT COUNT(*) FROM evacuation_move
                UNION ALL
                SELECT COUNT(*) FROM secrecy_move
              ) all_counts
            ) + (SELECT COUNT(*) FROM bids) AS total
        `,
      };

      const results = {};

      // Execute all queries asynchronously
      for (const [key, query] of Object.entries(countQueries)) {
        const [rows] = await db.promise().query(query);
        results[key] = rows[0];
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_TOTAL_COUNTS",
        "Viewed dashboard total counts and statistics",
        null,
        "dashboard"
      );

      res.status(200).json({
        message: "Counts fetched successfully.",
        data: results,
      });
    } catch (error) {
      console.error("Error fetching total counts:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch counts.",
      });
    }
  },
];

// get completed payments total
exports.getMonthlyBidsTotal = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      // Get the range of months where bids exist
      const rangeQuery = `
        SELECT 
          MIN(DATE_FORMAT(created_at, '%Y-%m-01')) AS start_date, 
          MAX(DATE_FORMAT(created_at, '%Y-%m-01')) AS end_date
        FROM bids
      `;

      const [rangeResults] = await db.promise().query(rangeQuery);
      const { start_date, end_date } = rangeResults[0];

      if (!start_date || !end_date) {
        return res.status(200).json({
          message: "No bids available.",
          data: [],
        });
      }

      // Query to fetch monthly bid totals (including accepted and completed payments)
      const query = `
        SELECT 
          DATE_FORMAT(b.created_at, '%M') AS month, 
          DATE_FORMAT(b.created_at, '%Y') AS year,
          COUNT(b.id) AS total_bids, 
          SUM(CASE WHEN ab.id IS NOT NULL THEN 1 ELSE 0 END) AS accepted_bids,
          SUM(CASE WHEN ab.payment_status = 'completed' THEN ab.final_price ELSE 0 END) AS total_paid_sek
        FROM bids b
        LEFT JOIN accepted_bids ab ON b.id = ab.bid_id
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
        ORDER BY DATE_FORMAT(b.created_at, '%Y-%m') DESC;
      `;

      const [bidData] = await db.promise().query(query);

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_MONTHLY_BIDS_TOTAL",
        "Viewed monthly bids total report",
        null,
        "report"
      );

      res.status(200).json({
        message: "Monthly bids total fetched successfully.",
        data: bidData,
      });
    } catch (error) {
      console.error("Error fetching monthly bids total:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch monthly bids total.",
      });
    }
  },
];

// Edit accepted bid (Super admin and Finance admin)
exports.editAcceptedBid = [
  checkRole(["super_admin", "finance_admin"]),
  async (req, res) => {
    const { bid_id, commission_percentage } = req.body;
    const connection = await db.promise();

    if (!bid_id || commission_percentage === undefined) {
      return res.status(400).json({
        error: "Bid ID and commission percentage are required.",
      });
    }

    if (isNaN(commission_percentage) || commission_percentage <= 0) {
      return res.status(400).json({
        error: "Commission percentage must be a positive number.",
      });
    }

    try {
      await connection.beginTransaction();

      // First check if there's already an accepted bid for this quotation
      const [existingAcceptedBid] = await connection.query(
        `
        SELECT COUNT(*) as count 
        FROM bids 
        WHERE status = 'accepted'
        AND quotation_id = (SELECT quotation_id FROM bids WHERE id = ?)
        AND quotation_type = (SELECT quotation_type FROM bids WHERE id = ?)
      `,
        [bid_id, bid_id]
      );

      if (existingAcceptedBid[0].count > 0) {
        throw {
          status: 400,
          message:
            "A bid has already been accepted for this quotation. Cannot accept multiple bids.",
        };
      }

      const [bids] = await connection.query(
        `
        SELECT 
          b.*, 
          b.bid_price AS amount, 
          s.email AS supplier_email, 
          s.company_name AS supplier_name,
          CASE 
            WHEN b.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad') THEN ms.email_address
            WHEN b.quotation_type = 'company_relocation' THEN cr.email_address
            WHEN b.quotation_type = 'move_out_cleaning' THEN mc.email_address
            WHEN b.quotation_type = 'storage' THEN st.email_address
            WHEN b.quotation_type = 'heavy_lifting' THEN hl.email_address
            WHEN b.quotation_type = 'carrying_assistance' THEN ca.email_address
            WHEN b.quotation_type = 'junk_removal' THEN jr.email_address
            WHEN b.quotation_type = 'estate_clearance' THEN ec.email_address
            WHEN b.quotation_type = 'evacuation_move' THEN em.email_address
            WHEN b.quotation_type = 'private_move' THEN pm.email_address
          END AS customer_email
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN moving_service ms ON b.quotation_id = ms.id AND b.quotation_type IN ('local_move', 'long_distance_move', 'moving_abroad')
        LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
        LEFT JOIN move_out_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'move_out_cleaning'
        LEFT JOIN storage st ON b.quotation_id = st.id AND b.quotation_type = 'storage'
        LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
        LEFT JOIN carrying_assistance ca ON b.quotation_id = ca.id AND b.quotation_type = 'carrying_assistance'
        LEFT JOIN junk_removal jr ON b.quotation_id = jr.id AND b.quotation_type = 'junk_removal'
        LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
        LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
        LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
        WHERE b.id = ? AND b.status = 'pending'
      `,
        [bid_id]
      );

      if (bids.length === 0) {
        throw { status: 404, message: "Bid not found or already processed." };
      }

      const bid = bids[0];
      bid.amount = parseFloat(bid.amount) || 0;

      if (!bid.amount || bid.amount <= 0) {
        throw { status: 400, message: "Invalid bid amount." };
      }

      const finalPrice = bid.amount * (1 + commission_percentage / 100);
      const isCompanyRelocation = bid.quotation_type === "company_relocation";

      // Reject other bids
      await connection.query(
        `
        UPDATE bids 
        SET status = 'rejected'
        WHERE quotation_id = ? 
        AND quotation_type = ?
        AND id != ?
        AND status = 'pending'
      `,
        [bid.quotation_id, bid.quotation_type, bid_id]
      );

      if (isCompanyRelocation) {
        await connection.query(
          `
          UPDATE bids
          SET status = 'accepted', total_price = ?
          WHERE id = ?
        `,
          [finalPrice, bid_id]
        );
      } else {
        const initialPayment = finalPrice * 0.2;
        const remainingPayment = finalPrice * 0.8;

        await connection.query(
          `
          UPDATE bids
          SET status = 'accepted', 
              total_price = ?,
              payment_status = 'awaiting_initial_payment'
          WHERE id = ?
        `,
          [finalPrice, bid_id]
        );

        await connection.query(
          `
          INSERT INTO bid_payments (
            bid_id, 
            initial_amount,
            remaining_amount,
            initial_payment_status,
            remaining_payment_status
          ) VALUES (?, ?, ?, 'pending', 'pending')
        `,
          [bid_id, initialPayment, remainingPayment]
        );
      }

      const quotationTable = [
        "local_move",
        "long_distance_move",
        "moving_abroad",
      ].includes(bid.quotation_type)
        ? "moving_service"
        : bid.quotation_type;

      await connection.query(
        `
        UPDATE ${quotationTable}
        SET status = 'awarded'
        WHERE id = ?
      `,
        [bid.quotation_id]
      );

      await connection.query(
        `
        INSERT INTO admin_commission (bid_id, commission_percentage, final_price)
        VALUES (?, ?, ?)
      `,
        [bid_id, commission_percentage, finalPrice]
      );

      const [rejectedBids] = await connection.query(
        `
        SELECT b.id, s.email AS supplier_email, s.company_name AS supplier_name
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE b.quotation_id = ?
        AND b.quotation_type = ?
        AND b.id != ?
        AND b.status = 'rejected'
      `,
        [bid.quotation_id, bid.quotation_type, bid_id]
      );

      if (isCompanyRelocation) {
        await emailService.sendEmail(bid.supplier_email, {
          subject: `Your Bid for Company Relocation Has Been Accepted`,
          html: `
            <p>Dear ${bid.supplier_name},</p>
            <p>Your bid for company relocation has been accepted. The bid price is ${parseFloat(
              bid.amount
            ).toFixed(2)} SEK.</p>
            <p>Please proceed with the next steps.</p>
          `,
        });
      } else {
        const initialPayment = finalPrice * 0.2;
        await emailService.sendEmail(bid.customer_email, {
          subject: `Action Required: Initial Payment for ${bid.quotation_type}`,
          html: `
            <p>A bid has been accepted for your ${
              bid.quotation_type
            } request.</p>
            <p>Total Price: ${finalPrice.toFixed(2)} SEK</p>
            <p>Required Initial Payment (20%): ${initialPayment.toFixed(
              2
            )} SEK</p>
            <p>Please complete the initial payment in flyttman website to proceed with the service.</p>
          `,
        });

        await emailService.sendEmail(bid.supplier_email, {
          subject: `Your Bid for ${bid.quotation_type} Has Been Accepted`,
          html: `
            <p>Dear ${bid.supplier_name},</p>
            <p>Your bid for ${
              bid.quotation_type
            } has been accepted. The total price is ${finalPrice.toFixed(
            2
          )} SEK.</p>
            <p>You will be notified once the customer completes the initial payment.</p>
          `,
        });
      }

      for (const rejectedBid of rejectedBids) {
        await emailService.sendEmail(rejectedBid.supplier_email, {
          subject: `Bid Status Update for ${bid.quotation_type}`,
          html: `
            <p>Dear ${rejectedBid.supplier_name},</p>
            <p>We regret to inform you that your bid for ${bid.quotation_type} was not selected.</p>
            <p>Thank you for participating in the bidding process.</p>
          `,
        });

        await notificationService.createNotification({
          recipientId: rejectedBid.supplier_email,
          recipientType: "supplier",
          title: "Uppdatering av budstatus",
          message: `Ditt bud för ${bid.quotation_type} valdes inte.`,
          type: "bid_rejected",
          referenceId: rejectedBid.id,
          referenceType: "bid",
        });
      }

      await connection.commit();

      res.status(200).json({
        message: "Bid approved successfully!",
        finalPrice,
        requiresInitialPayment: !isCompanyRelocation,
        initialPaymentAmount: isCompanyRelocation ? null : finalPrice * 0.2,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error in edit accepted bid:", error);
      res.status(error.status || 500).json({
        error: error.message || "Internal Server Error",
      });
    }
  },
];

// Marketplace management (Super admin only)
exports.marketPlace = [
  checkRole(["super_admin"]),
  async (req, res) => {
    const query = `
      SELECT 
        b.id AS bid_id,
        b.bid_price,
        b.total_price,
        b.additional_notes,
        b.created_at AS bid_created_at,
        b.quotation_id,
        b.quotation_type,
        s.company_name,
        s.email AS supplier_email,
        q.from_city,
        q.to_city,
        q.move_date,
        q.type_of_service
      FROM bids b
      JOIN suppliers s ON b.supplier_id = s.id
      JOIN (
        SELECT 
          'company_relocation' AS table_name, id, from_city, to_city, move_date, type_of_service FROM company_relocation
        UNION ALL
        SELECT 
          'move_out_cleaning' AS table_name, id, from_city, to_city, move_date, type_of_service FROM move_out_cleaning
        UNION ALL
        SELECT 
          'storage' AS table_name, id, from_city, to_city, move_date, type_of_service FROM storage
        UNION ALL
        SELECT 
          'heavy_lifting' AS table_name, id, from_city, to_city, move_date, type_of_service FROM heavy_lifting
        UNION ALL
        SELECT 
          'carrying_assistance' AS table_name, id, from_city, to_city, move_date, type_of_service FROM carrying_assistance
        UNION ALL
        SELECT 
          'junk_removal' AS table_name, id, from_city, to_city, move_date, type_of_service FROM junk_removal
        UNION ALL
        SELECT 
          'estate_clearance' AS table_name, id, from_city, to_city, move_date, type_of_service FROM estate_clearance
        UNION ALL
        SELECT 
          'evacuation_move' AS table_name, id, from_city, to_city, move_date, type_of_service FROM evacuation_move
        UNION ALL
        SELECT 
          'private_move' AS table_name, id, from_city, to_city, move_date, type_of_service FROM private_move
        UNION ALL
        SELECT 
          'local_move' AS table_name, 
          id, 
          from_city, 
          to_city, 
          move_date, 
          type_of_service 
        FROM moving_service 
        WHERE JSON_CONTAINS(type_of_service, '"local_move"')
        UNION ALL
        SELECT 
          'long_distance_move' AS table_name, 
          id, 
          from_city, 
          to_city, 
          move_date, 
          type_of_service 
        FROM moving_service 
        WHERE JSON_CONTAINS(type_of_service, '"long_distance_move"')
        UNION ALL
        SELECT 
          'moving_abroad' AS table_name, 
          id, 
          from_city, 
          to_city, 
          move_date, 
          type_of_service 
        FROM moving_service 
        WHERE JSON_CONTAINS(type_of_service, '"moving_abroad"')
      ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
      ORDER BY b.created_at DESC
    `;

    try {
      const [results] = await db.promise().query(query);

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No bids or quotations found in the marketplace." });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "VIEW_MARKETPLACE",
        `Viewed marketplace data`
      );

      return res.status(200).json({
        message: "Marketplace data retrieved successfully.",
        marketplace: results,
      });
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Supplier search (All admin roles)
exports.supplierSearch = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { company_name } = req.query;

    // Validate input
    if (!company_name || company_name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Company name is required for search." });
    }

    // SQL query to search for suppliers by company name
    const query = `
      SELECT 
        id, 
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
        about_us, 
        bank, 
        account_number, 
        iban, 
        swift_code, 
        created_at 
      FROM suppliers 
      WHERE company_name LIKE ?
    `;

    try {
      const [results] = await db.promise().query(query, [`%${company_name}%`]);

      if (results.length === 0) {
        return res.status(404).json({
          message: "No suppliers found with the provided company name.",
        });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "SEARCH_SUPPLIERS",
        `Searched for suppliers with company name: ${company_name}`
      );

      // Respond with the matching suppliers
      return res.status(200).json({
        message: "Suppliers retrieved successfully.",
        suppliers: results,
      });
    } catch (error) {
      console.error("Error searching suppliers:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Toggle auction mode (Super admin only)
exports.toggleAuctionMode = [
  checkRole(["super_admin"]),
  async (req, res) => {
    const { auction_enabled } = req.body;

    if (typeof auction_enabled !== "boolean") {
      return res.status(400).json({
        error: "Invalid input: auction_enabled must be a boolean.",
      });
    }

    try {
      await db
        .promise()
        .query(`UPDATE settings SET auction_enabled = ?`, [auction_enabled]);

      await logAdminActivity(
        req,
        req.admin.id,
        "TOGGLE_AUCTION_MODE",
        `Toggled auction mode to ${auction_enabled ? "enabled" : "disabled"}`
      );

      res.status(200).json({
        message: `Auction mode successfully ${
          auction_enabled ? "enabled" : "disabled"
        }. Restarting server...`,
      });

      // ✅ Restart the server
      console.log("Restarting server to apply new auction settings...");
      process.exit(1);
    } catch (error) {
      console.error("Error updating auction mode:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.getAuctionStatus = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      const [rows] = await db
        .promise()
        .query("SELECT auction_enabled FROM settings LIMIT 1");

      if (!rows.length) {
        return res.status(404).json({
          error: "Settings not found",
        });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "GET_AUCTION_STATUS",
        `Fetched auction status: ${
          rows[0].auction_enabled ? "enabled" : "disabled"
        }`
      );

      return res.status(200).json({
        auctionEnabled: Boolean(rows[0].auction_enabled),
        message: `Auction mode is currently ${
          rows[0].auction_enabled ? "enabled" : "disabled"
        }`,
      });
    } catch (error) {
      console.error("Error fetching auction status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.changeFixedPercentage = [
  checkRole(["super_admin"]),
  async (req, res) => {
    const { fixed_percentage } = req.body;

    // Validate input
    if (typeof fixed_percentage !== "number" || isNaN(fixed_percentage)) {
      return res.status(400).json({
        error: "Fixed percentage must be a valid number.",
      });
    }

    // Add constraints
    if (fixed_percentage < 0 || fixed_percentage > 100) {
      return res.status(400).json({
        error: "Fixed percentage must be between 0 and 100.",
      });
    }

    try {
      await db
        .promise()
        .query(`UPDATE settings SET fixed_percentage = ?, updated_at = NOW()`, [
          fixed_percentage,
        ]);

      await logAdminActivity(
        req,
        req.admin.id,
        "CHANGE_FIXED_PERCENTAGE",
        `Changed fixed percentage to ${fixed_percentage}%`
      );

      return res.status(200).json({
        message: `Fixed percentage successfully updated to ${fixed_percentage}%.`,
      });
    } catch (error) {
      console.error("Error updating fixed percentage:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

exports.getFixedPercentage = [
  checkRole(["super_admin"]),
  async (req, res) => {
    try {
      const [rows] = await db
        .promise()
        .query("SELECT fixed_percentage FROM settings LIMIT 1");

      if (!rows.length) {
        return res.status(404).json({
          error: "Settings not found",
        });
      }

      await logAdminActivity(
        req,
        req.admin.id,
        "GET_FIXED_PERCENTAGE",
        `Fetched fixed percentage: ${rows[0].fixed_percentage}%`
      );

      return res.status(200).json({
        fixed_percentage: rows[0].fixed_percentage,
        message: `Current fixed percentage is ${rows[0].fixed_percentage}%`,
      });
    } catch (error) {
      console.error("Error fetching fixed percentage:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// Funds disbursement (Super admin and Finance admin)
exports.fundsDisbursement = [
  checkRole(["super_admin", "finance_admin"]),
  async (req, res) => {
    const { bid_id } = req.body;

    if (!bid_id) {
      return res.status(400).json({ error: "Bid ID is required." });
    }

    try {
      // Check if the bid exists and is in 'completed' payment status
      const getBidQuery = `
        SELECT 
          b.id AS bid_id,
          b.payment_status,
          s.email AS supplier_email,
          s.company_name AS supplier_name,
          b.total_price
        FROM bids b
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE b.id = ?
      `;

      const [bid] = await db.promise().query(getBidQuery, [bid_id]);

      if (!bid || bid.length === 0) {
        return res.status(404).json({ error: "Bid not found." });
      }

      if (bid[0].payment_status !== "completed") {
        return res.status(400).json({
          error:
            "Funds can only be marked as disbursed for completed payments.",
        });
      }

      // Update the payment status to 'disbursed'
      const updatePaymentStatusQuery = `
        UPDATE bids
        SET disbursement_status = 'disbursed'
        WHERE id = ?
      `;

      await db.promise().query(updatePaymentStatusQuery, [bid_id]);

      // Notify the supplier via email
      await emailService.sendEmail(bid[0].supplier_email, {
        subject: `Funds Disbursed for Bid #${bid[0].bid_id}`,
        html: `
            <p>Dear ${bid[0].supplier_name},</p>
            <p>We are pleased to inform you that the payment for Bid #${
              bid[0].bid_id
            }, amounting to $${bid[0].total_price.toFixed(
          2
        )}, has been successfully disbursed.</p>
            <p>Please check your account for the transaction.</p>
            <p>Best regards,<br>Your Platform Team</p>
          `,
      });

      // Add an in-app notification for the supplier
      await notificationService.createNotification({
        recipientId: bid[0].supplier_email,
        recipientType: "supplier",
        title: "Medel Utdelade",
        message: `Payment for Bid #${
          bid[0].bid_id
        } amounting to $${bid[0].total_price.toFixed(2)} has been disbursed.`,
        type: "payment",
        referenceId: bid[0].bid_id,
        referenceType: "bid",
      });

      await logAdminActivity(
        req,
        req.admin.id,
        "FUNDS_DISBURSEMENT",
        `Disbursed funds for Bid #${bid[0].bid_id}`,
        bid[0].bid_id,
        "bid"
      );

      console.log(
        `Funds disbursed notification sent to supplier for bid ${bid[0].bid_id}.`
      );

      return res.status(200).json({
        message: `Funds for Bid #${bid[0].bid_id} have been successfully marked as disbursed.`,
      });
    } catch (error) {
      console.error("Error disbursing funds:", error);
      return res.status(500).json({
        error: "An error occurred while processing the disbursement.",
      });
    }
  },
];

// Get admin profile
exports.getProfile = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      await logAdminActivity(
        req,
        req.admin.id,
        "GET_PROFILE",
        `Fetched admin profile for ${req.admin.username}`
      );

      res.status(200).json({
        admin: {
          id: req.admin.id,
          username: req.admin.username,
          role: req.admin.role,
        },
      });
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// List all admins (Super admin only)
exports.listAdmins = [
  checkRole(["super_admin"]),
  async (req, res) => {
    const query = `
      SELECT id, username, role, created_at, firstname, lastname, phone_number
      FROM admin 
      WHERE id != ?
    `;

    try {
      const [results] = await db.promise().query(query, [req.admin.id]);

      await logAdminActivity(
        req,
        req.admin.id,
        "LIST_ADMINS",
        `Listed all admins`
      );

      res.status(200).json({
        admins: results,
      });
    } catch (error) {
      console.error("Error fetching admins:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// delete support and finance admin
exports.deleteAdmins = [
  checkRole(["super_admin"]),
  async (req, res) => {
    const { adminId } = req.params; // Admin ID to be deleted
    const deletingAdmin = req.admin.username; // Admin performing the action

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required." });
    }

    try {
      // Fetch the role of the admin to be deleted
      const fetchRoleQuery = `
        SELECT role, username 
        FROM admin 
        WHERE id = ?
      `;

      const [adminDetails] = await db
        .promise()
        .query(fetchRoleQuery, [adminId]);

      if (!adminDetails || adminDetails.length === 0) {
        return res.status(404).json({ error: "Admin not found." });
      }

      const { role: adminRole, username: deletedAdminUsername } =
        adminDetails[0];

      // Ensure the target admin is either a support_admin or finance_admin
      if (!["support_admin", "finance_admin"].includes(adminRole)) {
        return res.status(403).json({
          error: "Forbidden. You can only delete support or finance admins.",
        });
      }

      // Proceed with deletion
      const deleteQuery = `
        DELETE FROM admin 
        WHERE id = ?
      `;

      const [deleteResult] = await db.promise().query(deleteQuery, [adminId]);

      if (deleteResult.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Admin not found or could not be deleted." });
      }

      // Log deletion into notifications table
      const notificationQuery = `
        INSERT INTO notifications (
          recipient_id, 
          recipient_type, 
          title, 
          message, 
          type, 
          reference_id, 
          reference_type, 
          is_read, 
          created_at
        ) VALUES (?, 'admin', ?, ?, 'admin_deletion', ?, 'admin', FALSE, NOW())
      `;

      const notificationMessage = `Admin '${deletedAdminUsername}' (${adminRole}) togs bort av '${deletingAdmin}''.`;
      const notificationTitle = "Administratör borttagen";

      await db
        .promise()
        .query(notificationQuery, [
          deletingAdmin,
          notificationTitle,
          notificationMessage,
          adminId,
        ]);

      await logAdminActivity(
        req,
        req.admin.id,
        "DELETE_ADMIN",
        `Tog bort administratör ${deletedAdminUsername} med ID ${adminId}`,
        adminId,
        "admin"
      );

      res.status(200).json({
        message: `Administratör '${deletedAdminUsername}' med ID ${adminId} har tagits bort framgångsrikt.`,
      });
    } catch (error) {
      console.error("Error deleting admin:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "An error occurred while deleting the admin.",
      });
    }
  },
];

exports.approveSuppliers = [
  checkRole(["super_admin"]),

  // Validate request body
  [
    check("supplier_id")
      .isInt()
      .withMessage("supplier_id must be an integer")
      .notEmpty()
      .withMessage("supplier_id is required"),
  ],

  // Handle the request
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { supplier_id } = req.body;

    // Update query with parameterized values
    const query = `
      UPDATE suppliers 
      SET 
        reg_status = 'active'
      WHERE id = ?
    `;

    try {
      const [result] = await db.promise().query(query, [supplier_id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "No supplier found with the provided ID.",
        });
      }

      // Query to get updated supplier details
      const selectQuery = `
        SELECT id, company_name, email, reg_status 
        FROM suppliers 
        WHERE id = ?
      `;

      const [supplier] = await db.promise().query(selectQuery, [supplier_id]);

      await logAdminActivity(
        req,
        req.admin.id,
        "APPROVE_SUPPLIER",
        `Approved supplier ${supplier[0].company_name} with ID ${supplier[0].id}`,
        supplier[0].id,
        "supplier"
      );

      return res.status(200).json({
        message: "Supplier approved successfully",
        supplier: supplier[0],
      });
    } catch (error) {
      console.error("Error in approveSuppliers:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to update supplier status.",
      });
    }
  },
];

// Get all orders
exports.orders = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          -- Quotation details
          q.service_type,
          q.pickup_address,
          q.delivery_address,
          q.date,
          q.latest_date,
          q.name,
          q.ssn,
          q.email AS customer_email,
          q.phone AS customer_phone,
          q.services,
          q.status AS quotation_status,

          -- Bid details
          b.id AS bid_id,
          b.order_id,
          b.supplier_id,
          s.company_name AS supplier_name,
          b.created_at AS bid_created_at,
          b.approved_at AS bid_approved_date,
          b.supplier_notes,
          b.estimated_pickup_date_to,
          b.estimated_delivery_date_to,
          b.estimated_pickup_date_from,
          b.estimated_delivery_date_from,

          -- Accepted bid details
          ab.final_price,
          ab.payment_status,
          ab.order_status,

          -- Payment details
          bp.initial_payment_date,
          bp.remaining_payment_date
          
        FROM bids b
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        INNER JOIN accepted_bids ab ON b.id = ab.bid_id
        LEFT JOIN bid_payments bp ON b.id = bp.bid_id
        JOIN (
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 name, ssn, email, phone, services, status, 'private_move' AS table_name FROM private_move
          UNION ALL
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 NULL as name, ssn, email, phone, services, status, 'moving_cleaning' AS table_name FROM moving_cleaning
          UNION ALL
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 name, ssn, email, phone, services, status, 'heavy_lifting' AS table_name FROM heavy_lifting
          UNION ALL
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 name, ssn, email, phone, services, status, 'company_relocation' AS table_name FROM company_relocation
          UNION ALL
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 name, ssn, email, phone, services, status, 'estate_clearance' AS table_name FROM estate_clearance
          UNION ALL
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 name, ssn, email, phone, services, status, 'evacuation_move' AS table_name FROM evacuation_move
          UNION ALL
          SELECT id, service_type, pickup_address, delivery_address, date, latest_date,
                 name, ssn, email, phone, services, status, 'secrecy_move' AS table_name FROM secrecy_move
        ) q ON b.quotation_id = q.id AND b.quotation_type = q.table_name
        ORDER BY 
          CASE 
            WHEN ab.payment_status = 'paid' THEN 0
            WHEN ab.payment_status = 'initial_paid' THEN 1
            WHEN ab.payment_status = 'awaiting_remaining_payment' THEN 2
            WHEN ab.payment_status = 'awaiting_initial_payment' THEN 3
            WHEN ab.payment_status = 'failed' THEN 4
            ELSE 5
          END,
          b.created_at DESC
        LIMIT ? OFFSET ?;
      `;

      const [orders] = await db
        .promise()
        .query(query, [parseInt(limit), parseInt(offset)]);

      // Get total count of orders (only those with accepted bids)
      const countQuery = `SELECT COUNT(*) AS total FROM bids b INNER JOIN accepted_bids ab ON b.id = ab.bid_id`;
      const [countResult] = await db.promise().query(countQuery);
      const totalOrders = countResult[0].total;

      res.status(200).json({
        message: "All orders fetched successfully",
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
        },
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching orders for admin:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to fetch orders",
      });
    }
  },
];

// getting detailed  order
exports.adminOrderDetailsDetailed = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    try {
      // Step 1: Fetch bid details including supplier ID and quotation reference
      const bidQuery = `
        SELECT 
          b.id AS bid_id,
          b.supplier_id,
          b.quotation_id, 
          b.quotation_type,
          s.company_name AS supplier_name
        FROM bids b
        LEFT JOIN suppliers s ON b.supplier_id = s.id
        WHERE b.order_id = ?
        LIMIT 1;
      `;

      const bidDetails = await db.promise().query(bidQuery, [orderId]);
      if (!bidDetails[0].length) {
        return res.status(404).json({ error: "No bid found for this order." });
      }

      const {
        bid_id,
        supplier_id,
        quotation_id,
        quotation_type,
        supplier_name,
      } = bidDetails[0][0];

      // Step 2: Fetch full quotation details including distance
      const quotationQuery = `SELECT *, distance FROM ${quotation_type} WHERE id = ?;`;
      const quotation = await db
        .promise()
        .query(quotationQuery, [quotation_id]);

      if (!quotation[0].length) {
        return res.status(404).json({ error: "Quotation details not found." });
      }

      // Step 3: Fetch supplier rating (average rating for this supplier)
      const ratingQuery = `
        SELECT 
          COALESCE(AVG(rating), 0) AS avg_rating, 
          COUNT(*) AS total_reviews 
        FROM reviews 
        WHERE supplier_id = ?;
      `;

      const ratingResult = await db.promise().query(ratingQuery, [supplier_id]);
      const { avg_rating, total_reviews } = ratingResult[0][0];

      // Step 4: Fetch payment details from the checkout table
      const paymentQuery = `
        SELECT 
          payment_status, 
          total_price 
        FROM checkout 
        WHERE order_id = ? 
        LIMIT 1;
      `;

      const paymentResult = await db.promise().query(paymentQuery, [orderId]);
      const paymentDetails = paymentResult[0][0] || {
        payment_status: null,
        total_price: null,
      };

      //Step 5: get customer id
      const customerQuery = `
        SELECT 
          id 
        FROM customers 
        WHERE email = ? 
        LIMIT 1;
      `;
      const customerDetails = await db
        .promise()
        .query(customerQuery, [quotation[0][0].email]);
      const customerId = customerDetails[0][0].id;

      // Step 6: Return response
      res.status(200).json({
        message:
          "Order, quotation, supplier rating, and payment details fetched successfully",
        data: {
          order_id: orderId,
          bid_id,
          customer_id: customerId,
          supplier: {
            id: supplier_id,
            name: supplier_name,
            avg_rating: parseFloat(avg_rating).toFixed(2),
            total_reviews,
          },
          quotation: quotation[0][0],
          distance: quotation[0][0].distance, // Added distance
          payment_status: paymentDetails.payment_status, // Added payment_status
          total_price: paymentDetails.total_price, // Added total_price
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

// Search orders
exports.searchOrders = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const {
      search = "",
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.body;
    const offset = (page - 1) * limit;

    try {
      let query = `
        SELECT 
          b.order_id,
          b.quotation_id,
          b.quotation_type,
          b.supplier_id,
          b.created_at AS bid_created_at,
          ab.final_price,
          ab.payment_status,
          ab.order_status,
          s.company_name AS supplier_name,
          s.email AS supplier_email,
          COALESCE(r.avg_rating, 0) AS avg_rating,
          COALESCE(r.total_reviews, 0) AS total_reviews
        FROM bids b
        JOIN accepted_bids ab ON b.id = ab.bid_id
        JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN (
          SELECT supplier_id, 
                 AVG(rating) AS avg_rating, 
                 COUNT(*) AS total_reviews
          FROM reviews
          GROUP BY supplier_id
        ) r ON b.supplier_id = r.supplier_id
        WHERE 1=1
      `;

      const queryParams = [];

      // Search conditions
      if (search) {
        query += ` AND (
          b.order_id LIKE ? OR
          ab.order_status LIKE ? OR
          s.company_name LIKE ? OR
          s.email LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Status filter
      if (status) {
        query += ` AND ab.order_status = ?`;
        queryParams.push(status);
      }

      // Date range filters
      if (startDate) {
        query += ` AND b.created_at >= ?`;
        queryParams.push(startDate);
      }

      if (endDate) {
        query += ` AND b.created_at <= ?`;
        queryParams.push(endDate);
      }

      // Count total records
      const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS sub`;
      const [countResults] = await db.promise().query(countQuery, queryParams);
      const total = countResults[0].total;

      // Add pagination
      query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), parseInt(offset));

      // Execute main query
      const [orders] = await db.promise().query(query, queryParams);

      // Log admin search activity
      await logAdminActivity(
        req,
        req.admin.id,
        "SEARCH_ORDERS",
        `Searched orders with criteria: ${JSON.stringify({
          search,
          status,
          startDate,
          endDate,
        })}`,
        null,
        "orders_search"
      );

      res.status(200).json({
        message: "Orders search completed successfully!",
        total: Number(total),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        data: orders,
      });
    } catch (error) {
      console.error("Error searching orders:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to search orders.",
      });
    }
  },
];

// logout function
exports.adminLogout = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    try {
      // Ensure admin is authenticated
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      // Log admin logout action
      await logAdminActivity(
        req,
        req.admin.id,
        "LOGOUT",
        `Admin ${req.admin.username} logged out`
      );

      // Clear the JWT from cookies
      res.clearCookie("admin_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({ message: "Admin logout successful!" });
    } catch (error) {
      console.error("Error logging out admin:", error);
      return res.status(500).json({
        error: "Internal Server Error: Unable to log out admin.",
      });
    }
  },
];

// Delete a bid by ID (All admin roles)
exports.deleteBid = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Bid ID is required." });
    }
    try {
      // Check if the bid exists
      const [bid] = await db
        .promise()
        .query("SELECT id FROM bids WHERE id = ?", [id]);
      if (!bid.length) {
        return res.status(404).json({ error: "Bid not found." });
      }
      // Delete the bid
      const [result] = await db
        .promise()
        .query("DELETE FROM bids WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Bid could not be deleted." });
      }
      await logAdminActivity(
        req,
        req.admin.id,
        "DELETE_BID",
        `Deleted bid with ID ${id}`,
        id,
        "bid"
      );
      return res
        .status(200)
        .json({ message: `Bid with ID ${id} deleted successfully.` });
    } catch (error) {
      console.error("Error deleting bid:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error: Unable to delete bid." });
    }
  },
];

// View logs (returns last N lines or full file, admin only)
exports.viewLogs = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  (req, res) => {
    const logPath = path.join(__dirname, "../logs/region-access.log");
    const last = parseInt(req.query.last, 10) || 100;
    fs.readFile(logPath, "utf8", (err, data) => {
      if (err)
        return res.status(500).json({ error: "Could not read log file." });
      const lines = data.split("\n");
      const output = lines.slice(-last).join("\n");
      res.type("text/plain").send(output);
    });
  },
];

// Download logs (admin only)
exports.downloadLogs = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  (req, res) => {
    const logPath = path.join(__dirname, "../logs/region-access.log");
    res.download(logPath, "region-access.log", (err) => {
      if (err) res.status(500).json({ error: "Could not download log file." });
    });
  },
];
