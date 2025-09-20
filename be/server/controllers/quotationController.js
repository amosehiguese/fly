const db = require("../../db/connect");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const emailService = require("../../utils/emailService");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveFiles = async (files) => {
  if (!files || !files.files) return [];

  const fileArray = Array.isArray(files.files) ? files.files : [files.files];
  if (fileArray.length > 3) {
    throw new Error("Maximum 3 files allowed");
  }

  const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 20 * 1024 * 1024) {
    throw new Error("Total file size must not exceed 20MB");
  }

  const filePaths = [];
  for (const file of fileArray) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);
    filePaths.push(`uploads/${fileName}`);
  }
  return filePaths;
};

const sendErrorResponse = (res, statusCode, message) => {
  console.error(message);
  return res.status(statusCode).json({ error: message });
};

const validateBaseFields = (req) => {
  const {
    service_type,
    pickup_address,
    delivery_address,
    date,
    distance,
    latest_date,
    name,
    email,
    phone,
    services,
  } = req.body;

  if (
    !service_type ||
    !pickup_address ||
    !delivery_address ||
    !date ||
    !distance ||
    !latest_date ||
    !name ||
    !email ||
    !phone ||
    !services
  ) {
    return { isValid: false, error: "Missing required fields.", errorSv: "Obligatoriska fält saknas." };
  }

  return { isValid: true };
};

const checkAndCreateCustomer = (email, phone, res, callback) => {
  const checkCustomerQuery = `SELECT id FROM customers WHERE email = ? OR phone_num = ?`;
  db.query(checkCustomerQuery, [email, phone], (checkErr, checkResults) => {
    if (checkErr) {
      return sendErrorResponse(res, 500, "Internal Server Error");
    }
    if (checkResults.length > 0) {
      return callback(false);
    }
    const saltRounds = 10;
    bcrypt.hash(phone, saltRounds, (hashErr, hashedPassword) => {
      if (hashErr) {
        return sendErrorResponse(res, 500, "Internal Server Error");
      }
      const createCustomerQuery = `INSERT INTO customers (email, password, phone_num) VALUES (?, ?, ?)`;
      db.query(
        createCustomerQuery,
        [email, hashedPassword, phone],
        (createErr) => {
          if (createErr) {
            return sendErrorResponse(res, 500, "Internal Server Error");
          }
          return callback(true);
        }
      );
    });
  });
};

const handleQuotation = async (
  req,
  res,
  tableName,
  additionalFields = [],
  additionalValues = []
) => {
  try {
    const { email, phone, services, distance } = req.body;

    // Handle file uploads
    let filePaths = [];
    try {
      filePaths = await saveFiles(req.files);
    } catch (fileError) {
      return sendErrorResponse(res, 400, fileError.message);
    }

    // Add file_paths to additional fields
    additionalFields.push("file_paths");
    additionalValues.push(JSON.stringify(filePaths));

    // Validate required fields
    const validation = validateBaseFields(req);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Ensure additionalFields and additionalValues match in length
    if (additionalFields.length !== additionalValues.length) {
      console.error("Mismatch between additional fields and values");
      return res
        .status(500)
        .json({ error: "Internal Server Error: Field mismatch." });
    }

    // Build query dynamically
    const query = `
      INSERT INTO ${tableName} (
        service_type, pickup_address, delivery_address, date, distance, latest_date, 
        name, email, phone, services
        ${additionalFields.length > 0 ? `, ${additionalFields.join(", ")}` : ""}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        ${
          additionalValues.length > 0
            ? `, ${additionalValues.map(() => "?").join(", ")}`
            : ""
        }
      )
    `;

    const values = [
      req.body.service_type,
      req.body.pickup_address,
      req.body.delivery_address,
      req.body.date,
      req.body.distance,
      req.body.latest_date,
      req.body.name,
      email,
      phone,
      JSON.stringify(services),
      ...additionalValues,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return sendErrorResponse(res, 500, "Internal Server Error.");
      }

      // Notify all suppliers of new quotation
      db.query('SELECT email FROM suppliers', async (supplierErr, supplierResults) => {
        if (supplierErr) {
          console.error("Error fetching supplier emails:", supplierErr);
        } else if (supplierResults && supplierResults.length > 0) {
          const supplierEmails = supplierResults.map(row => row.email).filter(Boolean);
          // Prepare a professional notification template
          const template = {
            subject: "Ny offert tillgänglig",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f7f9fc; border-radius: 8px; border: 1px solid #e3e8ee;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <img src="https://flyttman.se/images/flyttman-logo.png" alt="Flyttman Logo" style="height: 60px; margin-bottom: 8px;"/>
                  <h2 style="color: #33658a; margin: 0;">Ny Offert!</h2>
                </div>
                <div style="background: #fff; border-radius: 6px; padding: 20px; box-shadow: 0 2px 8px rgba(51,101,138,0.04);">
                  <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Nyinkommen förfrågan! 🚚✨</p>
                  <p style="font-size: 15px; color: #333; margin-bottom: 18px;">
                    Kära leverantör,<br>
                    En ny kund har precis lagt upp en förfrågan.<br>
                    Lägg anbud direkt och öka chansen att boka uppdrag.<br>
                    <strong>Snabba svar leder till snabba bokningar – visa att du är redo!</strong>
                  </p>
                  <div style="text-align: center; margin: 24px 0;">
                    <a href="https://flyttman.se/supplier/jobs" style="background: #33658a; color: #fff; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 16px;">Visa Offert & Lämna Bud</a>
                  </div>
                  <p style="font-size: 14px; color: #666; margin-top: 24px;">Logga in på din leverantörspanel för att se alla tillgängliga offerter och hantera dina bud.</p>
                </div>
                <div style="text-align: center; margin-top: 32px; color: #999; font-size: 13px;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} Flyttman AB &mdash; Alla rättigheter förbehållna.</p>
                  <p style="margin: 4px 0 0;">Götgatan 50, 118 26 Stockholm, Sverige | <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a></p>
                </div>
              </div>
            `
          };
          // Send email to all suppliers (in parallel, but not awaited)
          supplierEmails.forEach(email => {
            require('../../utils/emailService').sendEmail(email, template);
          });
        }
      });

      checkAndCreateCustomer(email, phone, res, (created) => {
        // Skicka bekräftelsemail till kunden med inloggningsuppgifter
        try {
          const customerTemplate = created 
            ? emailService.templates.customerAccountCreated({
                customerName: req.body.name,
                email: email,
                phoneNumber: phone
              })
            : emailService.templates.customerQuoteSubmitted({
                customerName: req.body.name,
                email: email,
                phoneNumber: phone
              });
          require('../../utils/emailService').sendEmail(email, customerTemplate);
        } catch (e) {
          console.error('Kunde inte skicka bekräftelsemail till kund:', e);
        }
        const message = `${tableName.replace(
          "_",
          " "
        )} Begäran har skickats!`;
        return res.status(201).json({
          message: created
            ? `${message} An account has been created for the customer.`
            : `${message} However, an account could not be created as the email or phone number already exists.`,
          messageSv: created
            ? `${message} Ett konto har skapats för kunden.`
            : `${message} Dock kunde ett konto inte skapas eftersom e-postadressen eller telefonnumret redan finns.`,
          uploadedFiles: filePaths,
        });
      });
    });
  } catch (error) {
    console.error("Error in handleQuotation:", error);
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.privateMove = (req, res) => {
  handleQuotation(
    req,
    res,
    "private_move",
    [
      "move_type",
      "from_rok",
      "to_rok",
      "from_floor",
      "to_floor",
      "property_size",
      "home_description",
      "expectations",
      "extent",
      "storage",
      "garage",
      "other",
      "rut_discount",
      "extra_insurance",
      "ssn",
      "garage_description",
    ],
    [
      req.body.move_type || null,
      req.body.from_rok || null,
      req.body.to_rok || null,
      req.body.from_floor || null,
      req.body.to_floor || null,
      req.body.property_size || null,
      req.body.home_description || null,
      req.body.expectations || null,
      req.body.extent || null,
      JSON.stringify(req.body.storage) || null,
      req.body.garage !== undefined ? req.body.garage : false,
      req.body.other || null,
      req.body.rut_discount !== undefined ? req.body.rut_discount : false,
      req.body.extra_insurance !== undefined ? req.body.extra_insurance : false,
      req.body.ssn || null,
      req.body.garage_description || null,
    ]
  );
};

exports.movingCleaning = (req, res) => {
  handleQuotation(
    req,
    res,
    "moving_cleaning",
    [
      "move_type",
      "apartment",
      "villa",
      "pickup_property_size",
      "rok",
      "garage",
      "storage",
      "rut_discount",
      "ssn",
    ],
    [
      req.body.move_type || null,
      req.body.apartment !== undefined ? req.body.apartment : false,
      req.body.villa !== undefined ? req.body.villa : false,
      req.body.pickup_property_size || null,
      req.body.rok || null,
      req.body.garage !== undefined ? req.body.garage : false,
      JSON.stringify(req.body.storage) || null,
      req.body.rut_discount !== undefined ? req.body.rut_discount : false,
      req.body.ssn || null,
    ]
  );
};

exports.heavyLifting = (req, res) => {
  handleQuotation(
    req,
    res,
    "heavy_lifting",
    [
      "item_type",
      "item_count",
      "item_value",
      "item_weight",
      "from_floor",
      "to_floor",
      "rut_discount",
      "extra_insurance",
      "ssn",
    ],
    [
      req.body.item_type || null,
      req.body.item_count || null,
      req.body.item_value || null,
      req.body.item_weight || null,
      req.body.from_floor || null,
      req.body.to_floor || null,
      req.body.rut_discount !== undefined ? req.body.rut_discount : false,
      req.body.extra_insurance !== undefined ? req.body.extra_insurance : false,
      req.body.ssn || null,
    ]
  );
};

exports.companyRelocation = (req, res) => {
  handleQuotation(
    req,
    res,
    "company_relocation",
    ["move_type", "additional_services", "more_information", "company_name"],

    [
      req.body.move_type || null,
      JSON.stringify(req.body.additional_services) || "[]", // an array
      req.body.more_information || null,
      req.body.company_name || null,
    ]
  );
};

exports.estateClearance = (req, res) => {
  handleQuotation(
    req,
    res,
    "estate_clearance",
    [
      "move_type",
      "from_rok",
      "to_rok",
      "from_floor",
      "to_floor",
      "property_size",
      "home_description",
      "expectations",
      "extent",
      "storage",
      "garage",
      "other",
      "rut_discount",
      "ssn",
      "garage_description",
    ],
    [
      req.body.move_type || null,
      req.body.from_rok || null,
      req.body.to_rok || null,
      req.body.from_floor || null,
      req.body.to_floor || null,
      req.body.property_size || null,
      req.body.home_description || null,
      req.body.expectations || null,
      req.body.extent || null,
      JSON.stringify(req.body.storage) || null,
      req.body.garage !== undefined ? req.body.garage : false,
      req.body.other || null,
      req.body.rut_discount !== undefined ? req.body.rut_discount : false,
      req.body.ssn || null,
      req.body.garage_description || null,
    ]
  );
};

exports.evacuationMove = (req, res) => {
  console.log(req.body);
  handleQuotation(
    req,
    res,
    "evacuation_move",
    [
      "move_type",
      "from_rok",
      "to_rok",
      "from_floor",
      "to_floor",
      "property_size",
      "home_description",
      "expectations",
      "extent",
      "storage",
      "garage",
      "other",
      "rut_discount",
      "extra_insurance",
      "ssn",
      "garage_description",
    ],
    [
      req.body.move_type || null,
      req.body.from_rok || null,
      req.body.to_rok || null,
      req.body.from_floor || null,
      req.body.to_floor || null,
      req.body.property_size || null,
      req.body.home_description || null,
      req.body.expectations || null,
      req.body.extent || null,
      JSON.stringify(req.body.storage) || null,
      req.body.garage !== undefined ? req.body.garage : false,
      req.body.other || null,
      req.body.rut_discount !== undefined ? req.body.rut_discount : false,
      req.body.extra_insurance !== undefined ? req.body.extra_insurance : false,
      req.body.ssn || null,
      req.body.garage_description || null,
    ]
  );
};

exports.secrecyMove = (req, res) => {
  handleQuotation(
    req,
    res,
    "secrecy_move",
    [
      "move_type",
      "from_rok",
      "to_rok",
      "from_floor",
      "to_floor",
      "property_size",
      "home_description",
      "expectations",
      "extent",
      "storage",
      "garage",
      "other",
      "rut_discount",
      "extra_insurance",
      "ssn",
      "garage_description",
    ],
    [
      req.body.move_type || null,
      req.body.from_rok || null,
      req.body.to_rok || null,
      req.body.from_floor || null,
      req.body.to_floor || null,
      req.body.property_size || null,
      req.body.home_description || null,
      req.body.expectations || null,
      req.body.extent || null,
      JSON.stringify(req.body.storage) || null,
      req.body.garage !== undefined ? req.body.garage : false,
      req.body.other || null,
      req.body.rut_discount !== undefined ? req.body.rut_discount : false,
      req.body.extra_insurance !== undefined ? req.body.extra_insurance : false,
      req.body.ssn || null,
      req.body.garage_description || null,
    ]
  );
};

exports.customer_quotation_all = [
  checkRole(["super_admin", "support_admin", "finance_admin"]),
  (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
      return res
        .status(400)
        .json({ error: "An identifier (email or phone number) is required." });
    }

    const countQuery = `
      SELECT 
        (SELECT COUNT(*) FROM private_move WHERE email = ? OR phone = ?) +
        (SELECT COUNT(*) FROM moving_cleaning WHERE email = ? OR phone = ?) +
        (SELECT COUNT(*) FROM heavy_lifting WHERE email = ? OR phone = ?) +
        (SELECT COUNT(*) FROM company_relocation WHERE email = ? OR phone = ?) +
        (SELECT COUNT(*) FROM estate_clearance WHERE email = ? OR phone = ?) +
        (SELECT COUNT(*) FROM evacuation_move WHERE email = ? OR phone = ?) +
        (SELECT COUNT(*) FROM secrecy_move WHERE email = ? OR phone = ?)
      AS total_quotations
    `;

    const queries = {
      privacyMove: `SELECT * FROM private_move WHERE email = ? OR phone = ?`,
      movingCleaning: `SELECT * FROM moving_cleaning WHERE email = ? OR phone = ?`,
      heavyLifting: `SELECT * FROM heavy_lifting WHERE email = ? OR phone = ?`,
      companyRelocation: `SELECT * FROM company_relocation WHERE email = ? OR phone = ?`,
      estateClearance: `SELECT * FROM estate_clearance WHERE email = ? OR phone = ?`,
      evacuationMove: `SELECT * FROM evacuation_move WHERE email = ? OR phone = ?`,
      secrecyMove: `SELECT * FROM secrecy_move WHERE email = ? OR phone = ?`,
    };

    db.query(
      countQuery,
      Array(14).fill(identifier),
      (countErr, countResult) => {
        if (countErr) {
          console.error("Count Query Error:", countErr);
          return res.status(500).json({
            error: "Internal Server Error: Unable to get total count.",
          });
        }

        const totalQuotations = countResult[0].total_quotations;
        const results = {};
        const queryPromises = Object.entries(queries).map(([key, query]) => {
          return new Promise((resolve, reject) => {
            db.query(query, [identifier, identifier], (err, rows) => {
              if (err) {
                console.error(`Query Error (${key}):`, err);
                return reject(err);
              }
              if (rows.length > 0) {
                results[key] = rows;
              }
              resolve();
            });
          });
        });

        Promise.all(queryPromises)
          .then(() => {
            return res.status(200).json({
              message: "Data fetched successfully!",
              totalQuotations,
              data: results,
            });
          })
          .catch((err) => {
            console.error("Data Fetch Error:", err);
            return res
              .status(500)
              .json({ error: "Internal Server Error: Unable to fetch data." });
          });
      }
    );
  },
];
