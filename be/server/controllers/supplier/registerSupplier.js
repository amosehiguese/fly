const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");
const { error } = require("console");

// Function to handle file upload
const handleFileUpload = async (file, folder = "documents") => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const uploadDir = path.join(__dirname, `../../../uploads/${folder}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);

    file.mv(filePath, (err) => {
      if (err) return reject(err);
      resolve(`/uploads/${folder}/${fileName}`);
    });
  });
};

exports.registerSupplier = async (req, res) => {
  try {
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
      !company_name?.trim() ||
      !contact_person?.trim() ||
      !address?.trim() ||
      !postal_code?.trim() ||
      !city?.trim() ||
      !organization_number?.trim() ||
      !started_year?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Check if email, phone, or organization number already exists in suppliers
    const checkSupplierQuery = `
      SELECT 'supplier' AS source, id FROM suppliers WHERE email = ? OR phone = ? OR organization_number = ?
    `;
    const checkCustomerQuery = `
      SELECT 'customer' AS source, id FROM customers WHERE email = ? OR phone_num = ?
    `;

    const [[supplierExists], [customerExists]] = await Promise.all([
      db.promise().query(checkSupplierQuery, [email, phone, organization_number]),
      db.promise().query(checkCustomerQuery, [email, phone]),
    ]);

    if (supplierExists.length > 0 || customerExists.length > 0) {
      return res.status(409).json({
        error: "Email, phone number, or organization number already exists in the system.",
        errorSv: "E-postadress, telefonnummer eller organisationsnummer finns redan i systemet.",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Handle file uploads (documents)
    let uploadedFiles = [];
    if (req.files?.documents) {
      const documents = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      uploadedFiles = await Promise.all(
        documents.map((file) => handleFileUpload(file, "documents"))
      );
    }

    // Insert supplier data
    const insertSupplierQuery = `
      INSERT INTO suppliers (
        company_name, contact_person, address, postal_code, city, organization_number,
        started_year, trucks, phone, email, password, about_us, bank, account_number, iban, swift_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const supplierValues = [
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

    const [result] = await db.promise().query(insertSupplierQuery, supplierValues);
    const supplierId = result.insertId;

    // Store uploaded document URLs in supplier_documents table
    if (uploadedFiles.length > 0) {
      const docInsertQuery = `INSERT INTO supplier_documents (supplier_id, document_url) VALUES ?`;
      const docValues = uploadedFiles.map((url) => [supplierId, url]);
      await db.promise().query(docInsertQuery, [docValues]);
    }

    return res.status(201).json({
      message: "Supplier registered successfully!",
      messageSv: "Leverantör registrerad framgångsrikt!",
      supplier_id: supplierId,
      uploaded_documents: uploadedFiles,
    });
  } catch (error) {
    console.error("Error in supplier registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSupplierDetails = [
  authenticateJWT,
  checkRole(["super_admin"]),
  async (req, res) => {
    const { supplier_id } = req.params;

    if (!supplier_id) {
      return res.status(400).json({ error: "Supplier ID is required." });
    }

    try {
      const [supplierData] = await db.promise().query(
        `SELECT id, company_name, contact_person, address, postal_code, city, organization_number,
                started_year, trucks, phone, email, about_us, bank, account_number, iban, swift_code, created_at
         FROM suppliers WHERE id = ?`,
        [supplier_id]
      );

      if (supplierData.length === 0) {
        return res.status(404).json({ error: "Supplier not found." });
      }

      const supplier = supplierData[0];

      // Fetch documents
      const [documents] = await db
        .promise()
        .query(
          `SELECT document_url FROM supplier_documents WHERE supplier_id = ?`,
          [supplier_id]
        );

      const documentUrls = documents.map((doc) => doc.document_url);

      res.status(200).json({
        supplier,
        uploaded_documents: documentUrls,
      });
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
