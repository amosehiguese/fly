const db = require('../../../db/connect');
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/proof-of-delivery");
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
    return `/uploads/proof-of-delivery/${uniqueFilename}`;
};

exports.proofOfDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const driverId = req.user.id;
        const { deliveryNotes } = req.body;

        // Check if files were uploaded
        if (!req.files || !req.files.deliveryImage || !req.files.signatureImage) {
            return res.status(400).json({
                success: false,
                message: "Both delivery image and signature are required",
                messageSv: "Både leveransbild och signatur krävs"
            });
        }

        // Check if proof already exists
        const [existingProof] = await db.promise().query(
            'SELECT id FROM proof_of_delivery WHERE order_id = ?',
            [orderId]
        );

        if (existingProof.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Proof of delivery already exists for this order",
                messageSv: "Leveransbevis finns redan för denna order"
            });
        }

        // Verify driver assignment
        const [assignment] = await db.promise().query(
            'SELECT order_id FROM accepted_bids WHERE order_id = ? AND assignedDriverId = ?',
            [orderId, driverId]
        );

        if (assignment.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to submit proof for this order",
                messageSv: "Du är inte behörig att skicka in bevis för denna order"
            });
        }

        // Handle file uploads
        let deliveryImagePath = null;
        let signatureImagePath = null;

        try {
            deliveryImagePath = await handleFileUpload(req.files.deliveryImage);
            signatureImagePath = await handleFileUpload(req.files.signatureImage);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
                messageSv: "Fel vid uppladdning av filer"
            });
        }

        // Save proof of delivery
        await db.promise().query(
            `INSERT INTO proof_of_delivery 
            (order_id, driver_id, delivery_image, signature_image, delivery_notes) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                orderId,
                driverId,
                deliveryImagePath,
                signatureImagePath,
                deliveryNotes || null
            ]
        );

        // Update order status
        await db.promise().query(
            'UPDATE accepted_bids SET order_status = "delivered" WHERE order_id = ?',
            [orderId]
        );

        res.status(200).json({
            success: true,
            message: "Proof of delivery submitted successfully",
            messageSv: "Leveransbevis skickades framgångsrikt",
            data: {
                deliveryImage: deliveryImagePath,
                signatureImage: signatureImagePath,
                deliveryNotes: deliveryNotes
            }
        });

    } catch (error) {
        console.error('Error in proofOfDelivery:', error);
        res.status(500).json({
            success: false,
            message: "Error submitting proof of delivery",
            messageSv: "Fel vid inlämning av leveransbevis",
            error: error.message
        });
    }
};