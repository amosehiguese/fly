const bcrypt = require("bcryptjs");
const db = require("../../../db/connect");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/drivers-registration");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create upload directory if not exists
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
})();

// File upload helper
const handleFileUpload = async (file) => {
  if (!file) return null;

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only images (JPEG, PNG, GIF) are allowed."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum size is 5MB.");
  }

  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);

  await file.mv(filePath);
  return `/uploads/drivers-registration/${uniqueFilename}`;
};

exports.driversRegister = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      password,
      vehicleType,
      supplierId: bodySupplierId, // Get supplierId from body if provided
    } = req.body;

    // Get supplierId from either auth user or body
    const supplierId = req.user?.id || bodySupplierId;

    // Validate supplierId
    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID is required",
        messageSv: "Leverantörs-ID krävs",
      });
    }

    // Verify supplier exists
    const [supplierExists] = await db
      .promise()
      .query("SELECT id FROM suppliers WHERE id = ?", [supplierId]);

    if (!supplierExists.length) {
      return res.status(404).json({
        success: false,
        message: "Invalid supplier ID",
        messageSv: "Ogiltigt leverantörs-ID",
      });
    }

    // Basic validation
    if (!fullName || !phoneNumber || !email || !password ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
        messageSv: "Vänligen ange alla obligatoriska fält",
      });
    }

    // Check if driver already exists
    const [existingDriver] = await db
      .promise()
      .query("SELECT * FROM drivers WHERE email = ?", [email]);

    if (existingDriver.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Driver with this email already exists",
        messageSv: "Förare med denna e-postadress finns redan",
      });
    }

    // Handle file uploads
    let licenseImagePath = null;

    try {
      licenseImagePath = await handleFileUpload(req.files?.licenseImage);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        messageSv: "Fel vid uppladdning av filer",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert driver into database using promises
    const [result] = await db.promise().query(
      `INSERT INTO drivers (
        full_name,
        phone_number,
        email,
        password,
        vehicle_type,
        license_image,
        supplier_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        phoneNumber,
        email,
        hashedPassword,
        vehicleType || "null",
        licenseImagePath,
        supplierId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      messageSv: "Förare registrerad framgångsrikt",
      data: {
        id: result.insertId,
        fullName,
        email,
        phoneNumber,
        supplierId,
      },
    });
  } catch (error) {
    console.error("Driver registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering driver",
      messageSv: "Fel vid registrering av förare",
      error: error.message,
    });
  }
};
