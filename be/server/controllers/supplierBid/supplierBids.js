const path = require("path");
const fs = require("fs");
const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const emailService = require("../../../utils/emailService");
const notificationService = require("../../../utils/notificationService");
const {
  authenticateJWT,
  supplierIsLoggedIn,
} = require("../../controllers/loginController/authMiddleware");
const dotenv = require("dotenv");
dotenv.config();

exports.sendBid = [
  authenticateJWT,
  supplierIsLoggedIn,
  async (req, res) => {
    const {
      quotation_id,
      quotation_type,
      moving_cost,
      truck_cost = 0,
      additional_services,
      supplier_notes,
      estimated_pickup_date_to,
      estimated_delivery_date_to,
      estimated_pickup_date_from,
      estimated_delivery_date_from,
    } = req.body;

    if (!quotation_id || !quotation_type || !moving_cost) {
      return res.status(400).json({
        error: "Quotation ID, quotation type, and moving cost are required.",
      });
    }

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
      return res.status(400).json({ error: "Invalid quotation type provided." });
    }

    const supplier_id = req.user.id;

    if (!supplier_id) {
      return res.status(401).json({ error: "Unauthorized: Please log in as a supplier." });
    }

    let formattedAdditionalServices = 0;
    if (additional_services !== undefined) {
      if (isNaN(additional_services) || additional_services < 0) {
        return res.status(400).json({
          error: "Additional services price must be a valid non-negative number.",
        });
      }
      formattedAdditionalServices = parseFloat(additional_services);
    }

    // Fetch high-value bid threshold from settings
    let highValueBidThreshold = 20000; // Default fallback if DB query fails
    try {
      const [settings] = await db.promise().query(
        "SELECT high_value_bid_threshold FROM settings LIMIT 1"
      );

      if (settings.length > 0 && settings[0].high_value_bid_threshold) {
        highValueBidThreshold = parseFloat(settings[0].high_value_bid_threshold);
      }
    } catch (error) {
      console.error("Error fetching high-value bid threshold:", error);
    }

    const checkExistingBidQuery =
      `SELECT id FROM bids WHERE supplier_id = ? AND quotation_id = ? AND quotation_type = ?`;

    db.query(checkExistingBidQuery, [supplier_id, quotation_id, quotation_type], (err, existingBids) => {
      if (err) {
        console.error("Error checking existing bid:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (existingBids.length > 0) {
        return res.status(400).json({
          error: "You have already submitted a bid for this quotation.",
          errorSv: "Du har redan skickat ett bud för denna offert.",
        });
      }

      const validateQuotationQuery = `SELECT id FROM ${quotation_type} WHERE id = ? AND status = 'open'`;

      db.query(validateQuotationQuery, [quotation_id], (err, results) => {
        if (err) {
          console.error("Error validating quotation:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "Quotation not found or not open." });
        }

        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const order_id = `BID-${datePart}-${Math.floor(100 + Math.random() * 900)}`;

        let invoicePath = null;
        if (req.files && req.files.invoice) {
          const invoiceFile = req.files.invoice;

          if (invoiceFile.mimetype !== "application/pdf") {
            return res.status(400).json({ error: "Invalid file type. Only PDFs are allowed." });
          }

          const uploadDir = path.join(__dirname, "../../../uploads/invoices");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          invoicePath = `/uploads/invoices/${order_id}_${invoiceFile.name}`;
          const savePath = path.join(uploadDir, `${order_id}_${invoiceFile.name}`);

          invoiceFile.mv(savePath, (moveErr) => {
            if (moveErr) {
              console.error("Error saving invoice:", moveErr);
              return res.status(500).json({ error: "Failed to upload invoice." });
            }
          });
        }

        const totalBidAmount = parseFloat(moving_cost) + parseFloat(truck_cost) + formattedAdditionalServices;

        const insertBidQuery = `
          INSERT INTO bids (
            order_id, supplier_id, quotation_id, quotation_type, 
            moving_cost, truck_cost, additional_services, 
            invoice, status, created_at, supplier_notes, estimated_pickup_date_from, estimated_delivery_date_from, estimated_delivery_date_to, estimated_pickup_date_to
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), ?, ?, ?, ?, ?)
        `;

        const bidParams = [
          order_id,
          supplier_id,
          quotation_id,
          quotation_type,
          moving_cost,
          truck_cost,
          JSON.stringify(formattedAdditionalServices),
          invoicePath,
          supplier_notes || null,
          estimated_pickup_date_from || null,
          estimated_delivery_date_from || null,
          estimated_pickup_date_to || null,
          estimated_delivery_date_to || null,
        ];

        db.query(insertBidQuery, bidParams, async (insertErr, result) => {
          if (insertErr) {
            console.error("Error inserting bid data:", insertErr);
            return res.status(500).json({ error: "Internal Server Error: Unable to submit bid." });
          }

          const bid_id = result.insertId;

          try {
            await notificationService.createNotification({
              recipientId: "admin",
              recipientType: "admin",
              title: "Ny bud inlämnad",
              message: `Leverantör har lämnat ett bud för ${quotation_type} (ID: ${quotation_id}).`,
              type: "new_bid",
            });
          } catch (notificationErr) {
            console.error("Error sending notification:", notificationErr);
          }

          // Use the fetched threshold for high-value bids
          if (totalBidAmount > highValueBidThreshold) {
            const adminEmail = process.env.ADMIN_EMAIL;

            if (adminEmail) {
              try {
                await emailService.sendEmail(adminEmail, {
                  subject: "High Value Bid Requires Review",
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #e74c3c; margin-bottom: 20px;">⚠️ High Value Bid Alert</h2>
                        
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
                          A bid exceeding ${highValueBidThreshold} SEK requires your immediate attention.
                        </p>
                
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                          <h3 style="color: #2c3e50; margin-top: 0;">Bid Details:</h3>
                          <div style="color: #2c3e50; font-size: 15px; line-height: 1.8;">
                            <p><strong>Order ID:</strong> ${order_id}</p>
                            <p><strong>Quotation Type:</strong> ${quotation_type.replace(/_/g, ' ').toUpperCase()}</p>
                            <p><strong>Bid Amount:</strong> ${totalBidAmount.toFixed(2)} SEK</p>
                            <p><strong>Supplier ID:</strong> ${supplier_id}</p>
                          </div>
                        </div>
                
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="https://flyttman.se/admin/quotes-bids/bid/${bid_id}" 
                             style="display: inline-block; 
                                    background-color: #e74c3c; 
                                    color: white; 
                                    padding: 12px 30px; 
                                    text-decoration: none; 
                                    border-radius: 5px; 
                                    font-weight: bold;
                                    font-size: 16px;">
                            Review Bid Now
                          </a>
                        </div>
                
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 20px;">
                          <p style="color: #856404; margin: 0; font-size: 14px;">
                            ⏰ <strong>Important:</strong> This bid will be automatically processed in 1 hour if no action is taken.
                          </p>
                        </div>
                
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        
                        <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                          This is an automated message from Flyttman. Please do not reply to this email.
                        </p>
                      </div>
                    </div>
                  `
                });
                console.log("High-value bid email sent to admin.");
              } catch (emailErr) {
                console.error("Error sending high-value bid email:", emailErr);
              }
            }

            const insertHighValueBidQuery = `
              INSERT INTO high_value_bids (bid_id, order_id, quotation_id, quotation_type, total_bid_amount, notified_at)
              VALUES (?, ?, ?, ?, ?, NOW())
            `;

            db.query(insertHighValueBidQuery, [bid_id, order_id, quotation_id, quotation_type, totalBidAmount], (hvbErr) => {
              if (hvbErr) {
                console.error("Error inserting high-value bid:", hvbErr);
              } else {
                console.log("High-value bid recorded in database.");
              }
            });
          }

          res.status(201).json({
            message: "Bid submitted successfully!",
            messageSv: "Bud skickat framgångsrikt!",
            bidId: bid_id,
            order_id,
            invoicePath,
          });
        });
      });
    });
  },
];
