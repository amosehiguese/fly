const db = require("../../../db/connect");
const notificationService = require("../../../utils/notificationService");
const emailService = require("../../../utils/emailService");

// Add email template for job assignment
emailService.templates.jobAssignment = (data) => ({
  subject: `New Job Assignment - Order #${data.orderId}`,
html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">Nytt Uppdrag</h2>
        <p style="color: #666; margin-top: 5px; font-size: 16px;">Orderbekräftelse och Detaljer</p>
      </div>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 20px 0; border: 1px solid #e9ecef;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hej ${data.driverName},</p>
        
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Ett nytt uppdrag har tilldelats dig av ${data.supplierName}. Detta uppdrag har valts specifikt för din kompetens och erfarenhet.
        </p>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">Uppdragsinformation</h3>
          <div style="margin: 8px 0;"><strong style="color: #495057;">Order ID:</strong> #${data.orderId}</div>
          <div style="margin: 8px 0;"><strong style="color: #495057;">Tjänsttyp:</strong> ${data.serviceType}</div>
          <div style="margin: 8px 0;"><strong style="color: #495057;">Datum:</strong> ${data.date}</div>
          <div style="margin: 8px 0;"><strong style="color: #495057;">Plats:</strong> ${data.location}</div>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #495057; margin: 20px 0;">
          För att säkerställa en effektiv leverans, vänligen granska alla uppdragsdetaljer i ditt förarkonto. 
          Kvalitet och punktlighet är avgörande för vårt gemensamma success.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.WEBSITE_URL}/driver/jobs/${data.orderId}" 
             style="background-color: #0056b3; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; display: inline-block; 
                    font-weight: 600; font-size: 15px; transition: background-color 0.3s;">
            Se Uppdragsdetaljer
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Vi uppskattar ditt engagemang och professionalism.<br>
          Din insats är avgörande för våra kunders flyttupplevelse.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
        <p style="color: #666; font-size: 13px; line-height: 1.5; margin: 0;">
          Behöver du support? Kontakta din uppdragsgivare eller vårt supportteam.<br>
          <span style="color: #0056b3;">support@flyttman.se</span>
        </p>
      </div>
    </div>
  `
});

exports.assignJobDrivers = (req, res) => {
    const { orderId, driverId } = req.params;
    const supplierId = req.user.id;

    if (!orderId || !driverId) {
        return res.status(400).json({
            success: false,
            message: "Order ID and Driver ID are required",
            messageSv: "Order-ID och förar-ID krävs"
        });
    }

    // First check if job is already assigned
    db.query(
        'SELECT assignedDriverId FROM accepted_bids WHERE order_id = ? AND supplier_id = ?',
        [orderId, supplierId],
        (checkErr, checkResults) => {
            if (checkErr) {
                console.error("Error checking assignment status:", checkErr);
                return res.status(500).json({
                    success: false,
                    message: "Error checking job assignment status",
                    messageSv: "Fel vid kontroll av jobbstatus"
                });
            }

            if (!checkResults.length) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found",
                    messageSv: "Ordern hittades inte"
                });
            }

            if (checkResults[0].assignedDriverId) {
                return res.status(400).json({
                    success: false,
                    message: "This job has already been assigned to a driver",
                    messageSv: "Detta jobb har redan tilldelats en förare"
                });
            }

            // If not assigned, proceed with getting bid details
            db.query(
                `SELECT d.id, d.full_name, d.email, d.phone_number, 
                        s.company_name as supplier_name,
                        b.quotation_type, b.quotation_id,
                        b.estimated_pickup_date_from, b.estimated_pickup_date_to
                 FROM drivers d
                 JOIN suppliers s ON s.id = d.supplier_id
                 JOIN bids b ON b.order_id = ?
                 WHERE d.id = ? AND d.supplier_id = ?`,
                [orderId, driverId, supplierId],
                async (err, results) => {
                    if (err) {
                        console.error("Error fetching details:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Error fetching details",
                            messageSv: "Fel vid hämtning av detaljer"
                        });
                    }

                    if (results.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Driver or order not found",
                            messageSv: "Förare eller order hittades inte"
                        });
                    }

                    const driverDetails = results[0];
                    const { quotation_type, quotation_id } = driverDetails;

                    // Get location details using parameterized query
                    db.query(
                        'SELECT * FROM ?? WHERE id = ?',
                        [quotation_type, quotation_id],
                        async (locErr, locResults) => {
                            if (locErr || locResults.length === 0) {
                                console.error("Error fetching location:", locErr);
                                return res.status(500).json({
                                    success: false,
                                    message: "Error fetching location details",
                                    messageSv: "Fel vid hämtning av platsdetaljer"
                                });
                            }

                            const location = locResults[0].pickup_address || locResults[0].delivery_address;

                            if (!location) {
                                console.error("Location data missing:", locResults[0]);
                                return res.status(500).json({
                                    success: false,
                                    message: "Location data not found in quotation",
                                    messageSv: "Platsdata hittades inte i offerten"
                                });
                            }

                            // Update the accepted_bids table
                            db.query(
                                'UPDATE accepted_bids SET assignedDriverId = ? WHERE order_id = ? AND supplier_id = ?',
                                [driverId, orderId, supplierId],
                                async (updateErr, updateResult) => {
                                    if (updateErr || updateResult.affectedRows === 0) {
                                        console.error("Error assigning driver:", updateErr);
                                        return res.status(500).json({
                                            success: false,
                                            message: "Error assigning driver to job",
                                            messageSv: "Fel vid tilldelning av förare till jobbet"
                                        });
                                    }

                                    try {
                                        // Prepare notification data
                                        const notificationData = {
                                            orderId,
                                            driverName: driverDetails.full_name,
                                            supplierName: driverDetails.supplier_name,
                                            serviceType: quotation_type,
                                            date: `${driverDetails.estimated_pickup_date_from} to ${driverDetails.estimated_pickup_date_to}`,
                                            location: location
                                        };

                                        // Send notifications concurrently
                                        await Promise.all([
                                            emailService.sendEmail(
                                                driverDetails.email,
                                                emailService.templates.jobAssignment(notificationData)
                                            ),
                                            notificationService.createNotification({
                                                recipientId: driverId,
                                                recipientType: 'driver',
                                                title: 'Nytt Jobbuppdrag',
                                                message: `Du har tilldelats Order #${orderId} - ${quotation_type}`,
                                                type: 'JOB_ASSIGNMENT',
                                                referenceId: orderId,
                                                referenceType: 'order'
                                            })
                                        ]);

                                        res.status(200).json({
                                            success: true,
                                            message: "Driver successfully assigned to job",
                                            messageSv: "Föraren har tilldelats jobbet framgångsrikt"
                                        });
                                    } catch (error) {
                                        console.error("Error sending notifications:", error);
                                        console.error("Notification error details:", error.message);
                                        
                                        res.status(200).json({
                                            success: true,
                                            message: "Driver assigned but notification failed",
                                            messageSv: "Föraren tilldelad men notifiering misslyckades"
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};