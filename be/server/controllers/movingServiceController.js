const db = require("../../db/connect");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const emailService = require("../../utils/emailService");

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

const validateBaseFields = (req) => {
  const {
    from_city,
    to_city,
    move_date,
    type_of_service,
    email_address,
    phone_number,
  } = req.body;
  if (
    !from_city ||
    !to_city ||
    !move_date ||
    !type_of_service ||
    !email_address ||
    !phone_number
  ) {
    return { isValid: false, error: "Missing required fields." };
  }
  return { isValid: true };
};

exports.movingService = async (req, res) => {
  try {
    const {
      from_city,
      to_city,
      move_date,
      type_of_service,
      email_address,
      phone_number,
      volume_of_items,
      property_size,
      floor_details,
      list_of_larger_items,
      needs_packing,
      needs_dump_service,
      heavy_lifting_required,
    } = req.body;

    // Parse type_of_service if it's a string
    let parsedTypeOfService;
    try {
      parsedTypeOfService =
        typeof type_of_service === "string"
          ? JSON.parse(type_of_service)
          : type_of_service;
    } catch (error) {
      return res.status(400).json({
        error: "Invalid type_of_service format. Must be JSON array string.",
      });
    }

    // Handle file uploads
    let filePaths = [];
    try {
      filePaths = await saveFiles(req.files);
    } catch (fileError) {
      return res.status(400).json({ error: fileError.message });
    }

    // Validate basic fields
    const validation = validateBaseFields(req);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Validate type_of_service
    const allowedServices = [
      "local_move",
      "long_distance_move",
      "moving_abroad",
    ];
    const validServices =
      Array.isArray(parsedTypeOfService) &&
      parsedTypeOfService.every((service) => allowedServices.includes(service));

    if (!validServices) {
      return res.status(400).json({
        error:
          "Invalid type of service. Must be one or more of: local_move, long_distance_move, moving_abroad",
      });
    }

    const query = `
      INSERT INTO moving_service (
        from_city, 
        to_city, 
        move_date, 
        type_of_service, 
        email_address, 
        phone_number, 
        volume_of_items, 
        property_size, 
        floor_details, 
        list_of_larger_items, 
        needs_packing, 
        needs_dump_service, 
        heavy_lifting_required,
        file_paths
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      from_city,
      to_city,
      move_date,
      JSON.stringify(type_of_service),
      email_address,
      phone_number,
      volume_of_items || null,
      property_size || null,
      floor_details || null,
      list_of_larger_items || null,
      needs_packing || false,
      needs_dump_service || false,
      heavy_lifting_required || false,
      JSON.stringify(filePaths),
    ];

    // Insert moving service data into the database
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Check if an account already exists
      const checkCustomerQuery = `SELECT id FROM customers WHERE email = ? OR phone_num = ?`;      db.query(
        checkCustomerQuery,
        [email_address, phone_number],
        (checkErr, checkResults) => {
          if (checkErr) {
            console.error("Error checking customer account:", checkErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          if (checkResults.length > 0) {
            // Send email notification to existing customer
            try {
              const customerTemplate = emailService.templates.customerQuoteSubmitted({
                customerName: req.body.name,
                email: email_address,
                phoneNumber: phone_number
              });
              require('../../utils/emailService').sendEmail(email_address, customerTemplate);
            } catch (e) {
              console.error('Kunde inte skicka bekräftelsemail till kund:', e);
            }

            return res.status(201).json({
              message:
                "Moving service request submitted successfully! Account already exists.",
              uploadedFiles: filePaths,
            });
          }

          // Create new account if none exists
          const saltRounds = 10;
          bcrypt.hash(phone_number, saltRounds, (hashErr, hashedPassword) => {
            if (hashErr) {
              console.error("Error hashing password:", hashErr);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            const createCustomerQuery = `INSERT INTO customers (email, password, phone_num) VALUES (?, ?, ?)`;
            db.query(
              createCustomerQuery,
              [email_address, hashedPassword, phone_number],
              (createErr) => {
                if (createErr) {
                  console.error("Error creating customer account:", createErr);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }

                // Send email notification to customer with login credentials
                try {
                  const customerTemplate = emailService.templates.customerAccountCreated({
                    customerName: req.body.name,
                    email: email_address,
                    phoneNumber: phone_number
                  });
                  require('../../utils/emailService').sendEmail(email_address, customerTemplate);
                } catch (e) {
                  console.error('Kunde inte skicka bekräftelsemail till kund:', e);
                }

                return res.status(201).json({
                  message:
                    "Moving service request submitted successfully! Account created for the customer.",
                  uploadedFiles: filePaths,
                });
              }
            );
          });
        }
      );
    });
  } catch (error) {
    console.error("Error in movingService:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
