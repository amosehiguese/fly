const cron = require("node-cron");
const db = require("../../db/connect");
const notificationService = require("../../utils/notificationService");
const emailService = require("../../utils/emailService");
const invoiceService = require("../../utils/invoiceService");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../controllers/loginController/authMiddleware");

let auctionCronJob = null;

const runAuctionCron = async () => {
  try {
    // Fetch auction settings
    const [settings] = await db
      .promise()
      .query(
        "SELECT auction_enabled, moving_cost_percentage, additional_services_percentage, cost_of_truck, auction_duration_minutes, high_value_bid_threshold FROM settings LIMIT 1"
      );

    if (settings.length === 0) {
      console.error("Auction settings not configured.");
      return;
    }

    const {
      auction_enabled,
      moving_cost_percentage,
      additional_services_percentage,
      cost_of_truck,
      auction_duration_minutes,
      high_value_bid_threshold,
    } = settings[0];

    if (!auction_enabled) {
      console.log("Auction process is currently disabled.");
      return;
    }

    // Stop existing cron job if running
    if (auctionCronJob) {
      auctionCronJob.stop();
      console.log("Stopped previous auction cron job.");
    }

    // Start new cron job
    auctionCronJob = cron.schedule(
      `*/${auction_duration_minutes} * * * *`,
      async () => {
        console.log("Running auction cron job...");

        try {
          // Fetch open quotations
          const openQuotationsQuery = `
          SELECT DISTINCT id, quotation_type 
          FROM (
            SELECT id, 'private_move' AS quotation_type FROM private_move WHERE status = 'open'
            UNION ALL
            SELECT id, 'moving_cleaning' AS quotation_type FROM moving_cleaning WHERE status = 'open'
            UNION ALL
            SELECT id, 'heavy_lifting' AS quotation_type FROM heavy_lifting WHERE status = 'open'
            UNION ALL
            SELECT id, 'company_relocation' AS quotation_type FROM company_relocation WHERE status = 'open'
            UNION ALL
            SELECT id, 'estate_clearance' AS quotation_type FROM estate_clearance WHERE status = 'open'
            UNION ALL
            SELECT id, 'evacuation_move' AS quotation_type FROM evacuation_move WHERE status = 'open'
            UNION ALL
            SELECT id, 'secrecy_move' AS quotation_type FROM secrecy_move WHERE status = 'open'
          ) AS q
        `;

          const [openQuotations] = await db
            .promise()
            .query(openQuotationsQuery);

          if (openQuotations.length === 0) {
            console.log("No open quotations for auction.");
            return;
          }

          for (const quotation of openQuotations) {
            let quoteColumns =
              "q.name, q.ssn, q.email AS customer_email, q.pickup_address, q.delivery_address";

            if (quotation.quotation_type !== "company_relocation") {
              quoteColumns += ", q.extra_insurance";
            } else {
              quoteColumns += ", FALSE AS extra_insurance";
            }

            const bidsQuery = `
            SELECT 
              b.*, 
              s.email AS supplier_email, 
              s.company_name AS supplier_name,
              ${quoteColumns},
              (IFNULL(b.moving_cost, 0) + IFNULL(b.additional_services, 0) + IFNULL(b.truck_cost, 0)) AS total_bid_amount
            FROM bids b
            JOIN suppliers s ON b.supplier_id = s.id
            JOIN ${quotation.quotation_type} q ON b.quotation_id = q.id
            WHERE b.quotation_id = ? 
              AND b.quotation_type = ? 
              AND b.status = 'pending'
            ORDER BY total_bid_amount ASC
          `;

            const [bids] = await db
              .promise()
              .query(bidsQuery, [quotation.id, quotation.quotation_type]);

            if (bids.length > 0) {
              const winningBid = bids[0];

              const [highValueBid] = await db
                .promise()
                .query(
                  `SELECT 1 FROM high_value_bids WHERE bid_id = ? LIMIT 1`,
                  [winningBid.id]
                );

              if (highValueBid.length > 0) {
                console.log(
                  `High-value bid detected for Bid ID: ${winningBid.id}. Waiting 1 hour before processing...`
                );
                await new Promise((resolve) =>
                  setTimeout(resolve, 0.2 * 60 * 1000)
                );
              }

            
              const connection = await db.promise().getConnection();
              try {
                await connection.beginTransaction();

                const movingCostWithCommission =
                  parseFloat(winningBid.moving_cost || 0) *
                  (1 + moving_cost_percentage / 100);
                const additionalServiceWithCommission =
                  (winningBid.additional_service
                    ? parseFloat(winningBid.additional_service)
                    : 0) *
                  (1 + additional_services_percentage / 100);
                const totalTruckCost =
                  (winningBid.truck_cost
                    ? parseFloat(winningBid.truck_cost)
                    : 0) *
                  (1 + cost_of_truck / 100);

                const basePrice =
                  movingCostWithCommission +
                  additionalServiceWithCommission +
                  totalTruckCost;

                let finalPrice = Math.round(basePrice);

                if (
                  quotation.quotation_type !== "company_relocation" &&
                  winningBid.extra_insurance
                ) {
                  finalPrice += 249;
                }

                const initialPayment = finalPrice * 0.2;
                const remainingPayment = finalPrice * 0.8;

                await connection.query(
                  `INSERT INTO accepted_bids (
                    order_id, bid_id, supplier_id, quotation_id, quotation_type, 
                    moving_price_percentage, additional_service_percentage, truck_cost,
                    final_price, initial_payment, remaining_payment, 
                    payment_status, order_status, created_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'awaiting_initial_payment', 'accepted', NOW())`,
                  [
                    winningBid.order_id,
                    winningBid.id,
                    winningBid.supplier_id,
                    winningBid.quotation_id,
                    winningBid.quotation_type,
                    moving_cost_percentage,
                    additional_services_percentage,
                    cost_of_truck,
                    finalPrice,
                    initialPayment,
                    remainingPayment,
                  ]
                );

                await connection.query(
                  `UPDATE bids SET status = 'rejected' WHERE quotation_id = ? AND quotation_type = ? AND id != ? AND status = 'pending'`,
                  [
                    winningBid.quotation_id,
                    winningBid.quotation_type,
                    winningBid.id,
                  ]
                );

                await connection.query(
                  `UPDATE bids SET status = 'approved' WHERE id = ?`,
                  [winningBid.id]
                );

                await connection.query(
                  `UPDATE ${winningBid.quotation_type} SET status = 'awarded' WHERE id = ?`,
                  [winningBid.quotation_id]
                );

                await connection.commit();
                connection.release();

                console.log(
                  `Auction completed for ${quotation.quotation_type} (ID: ${quotation.id}). Winning bid: ${winningBid.id} with amount: ${winningBid.total_bid_amount}`
                );

                // ✅ Notify the winning supplier
                await emailService.sendEmail(winningBid.supplier_email, {
                  subject: `Ditt bud för ${winningBid.quotation_type} har accepterats.`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">Grattis! 🎉</h2>
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
                          Ditt bud för ${winningBid.quotation_type.replace(/_/g, " ").toLowerCase()}-tjänsten har accepterats.
                        </p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                          <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                            <strong>Order Details:</strong><br>
                            Order-ID: ${winningBid.order_id}<br> Slutpris: ${winningBid.total_bid_amount.toFixed(2)} SEK
                          </p>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="https://flyttman.se/supplier/orders/${winningBid.order_id}" 
                             style="display: inline-block; 
                                    background-color: #4CAF50; 
                                    color: white; 
                                    padding: 12px 30px; 
                                    text-decoration: none; 
                                    border-radius: 5px; 
                                    font-weight: bold;
                                    font-size: 16px;">
                            Visa Orderdetaljer
                          </a>
                        </div>
                        <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                          Om du har några frågor, tveka inte att kontakta vårt supportteam.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                         Detta är ett automatiserat meddelande från Flyttman. Vänligen svara inte på detta mejl.
                        </p>
                      </div>
                    </div>
                  `
                });

                // ✅ Notify rejected suppliers
                for (const bid of bids.slice(1)) {
                  await emailService.sendEmail(bid.supplier_email, {
                    subject: `Uppdatering om ditt bud för ${bid.quotation_type}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          <h2 style="color: #2c3e50; margin-bottom: 20px;">Uppdatering av Budstatus</h2>
                          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
                            Vi uppskattar ditt deltagande i budgivningen för ${bid.quotation_type.replace(/_/g, " ").toLowerCase()}-tjänsten.
                          </p>
                          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                              Tyvärr har ett annat bud valts för denna tjänst. Vi uppmuntrar dig att fortsätta delta i framtida möjligheter.
                            </p>
                          </div>
                          <div style="text-align: center; margin: 30px 0;">
                            <a href="https://flyttman.se/supplier/dashboard" 
                               style="display: inline-block; 
                                      background-color: #3498db; 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      font-weight: bold;
                                      font-size: 16px;">
                              Se Fler Möjligheter
                            </a>
                          </div>
                          <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                            Tack för att du är en värderad partner. Vi ser fram emot ditt deltagande i framtida möjligheter.
                          </p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                          <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                            Detta är ett automatiserat meddelande från Flyttman. Vänligen svara inte på detta e-postmeddelande.
                          </p>
                        </div>
                      </div>
                    `
                  });
                }

                // ✅ Notify the customer
                // await emailService.sendEmail(winningBid.customer_email, {
                //   subject: `Bid Received for Your Moving Request`,
                //   html: `<p>A bid has been placed on your quotation. Please review and proceed with the next steps.</p>`,
                // });

                const invoiceData = {
                  order_id: winningBid.order_id,
                  bid_id: winningBid.id,
                  customer_name:
                    winningBid.customer_name ||
                    `${quotation.first_name || ""} ${
                      quotation.last_name || ""
                    }`.trim(),
                  customer_email: winningBid.customer_email,
                  ssn: quotation.ssn || "",
                  service_description: `${winningBid.quotation_type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())} - Invoice`,
                  amount: finalPrice,
                  initial_payment: initialPayment,
                  from_city: quotation.pickup_address || "",
                  to_city: quotation.delivery_address || "",
                  move_date: winningBid.estimated_completion_date || "",
                  insurance_cost: quotation.extra_insurance ? 249 : 0,
                  tax_deduction: quotation.rut_discount ? finalPrice * 0.5 : 0,
                  services: [
                    {
                      description: "Moving Cost",
                      quantity: 1,
                      unit_price: movingCostWithCommission || 0,
                    },
                    {
                      description: "Truck Cost",
                      quantity: 1,
                      unit_price: totalTruckCost || 0,
                    },
                    {
                      description: "Additional Services",
                      quantity: 1,
                      unit_price: additionalServiceWithCommission || 0,
                    },
                  ],
                };

                const invoicePath = await invoiceService.generateInvoice(
                  invoiceData
                );

                // ✅ Step 11: Email customer with invoice
                await emailService.sendEmail(
                  //quotation.email,
                  winningBid.customer_email,
                  emailService.templates.invoiceEmail({
                    invoiceNumber: winningBid.order_id,
                    orderId: winningBid.order_id,
                    bidId: winningBid.id,
                    customerName: `${quotation.first_name || ""} ${
                      quotation.last_name || ""
                    }`.trim(),
                    ssn: quotation.ssn,
                    service: winningBid.quotation_type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()),
                    fromCity: quotation.pickup_address || "",
                    toCity: quotation.delivery_address || "",
                    moveDate: winningBid.estimated_completion_date
                      ? new Date(
                          winningBid.estimated_completion_date
                        ).toLocaleDateString("sv-SE")
                      : "",
                    movingCost: movingCostWithCommission,
                    truckCost: truckCostWithCommission,
                    additionalServices: additionalServiceWithCommission,
                    insuranceCost: quotation.extra_insurance ? 249 : 0,
                    totalAmount: finalPrice,
                    taxDeduction: quotation.rut_discount ? finalPrice * 0.5 : 0,
                    initialPayment: initialPayment,
                  }),
                  [
                    {
                      filename: `invoice-${winningBid.order_id}.pdf`,
                      path: invoicePath,
                      contentType: "application/pdf",
                    },
                    {
                      filename: "flyttman-logo.png",
                      path: path.join(
                        __dirname,
                        "../../../public/images/flyttman-logo.png"
                      ),
                      cid: "company-logo",
                    },
                  ]
                );
              } catch (error) {
                await connection.rollback();
                connection.release();
                console.error(
                  `Error processing auction for ${quotation.id}:`,
                  error
                );
              }
            }
          }
        } catch (error) {
          console.error("Error in auction cron job:", error);
        }
      }
    );

    console.log(
      `Auction cron job started, running every ${auction_duration_minutes} minutes.`
    );
  } catch (error) {
    console.error("Error initializing auction cron job:", error);
  }
};

const toggleAuctionCron = async () => {
  try {
    const [settings] = await db
      .promise()
      .query(
        "SELECT auction_enabled, auction_secondary_duration_minutes FROM settings LIMIT 1"
      );

    if (settings.length === 0) {
      console.error("Auction settings not found.");
      return;
    }

    const { auction_enabled, auction_secondary_duration_minutes } = settings[0];

    if (!auction_enabled) {
      console.log("Auction is already disabled. No cron needed.");
      return;
    }

    if (auction_secondary_duration_minutes <= 0) {
      console.log("Auction auto-toggle duration not set. Skipping cron.");
      return;
    }

    cron.schedule(
      `*/${auction_secondary_duration_minutes} * * * *`,
      async () => {
        console.log("Checking if auction mode should be disabled...");

        try {
          // Fetch the latest auction status
          const [currentSettings] = await db
            .promise()
            .query("SELECT auction_enabled FROM settings LIMIT 1");

          if (currentSettings.length === 0) {
            console.error("Settings table is empty. Cannot toggle auction.");
            return;
          }

          const currentAuctionStatus = currentSettings[0].auction_enabled;

          // Only disable if it's currently enabled
          if (currentAuctionStatus) {
            await db
              .promise()
              .query(`UPDATE settings SET auction_enabled = ?`, [false]);

            console.log(
              "Auction mode automatically disabled after the set duration."
            );
          }
        } catch (error) {
          console.error("Error disabling auction mode automatically:", error);
        }
      }
    );

    console.log(
      `Auction auto-disable cron started, running after ${auction_secondary_duration_minutes} minutes.`
    );
  } catch (error) {
    console.error("Error initializing auction auto-disable cron:", error);
  }
};

module.exports = { runAuctionCron, toggleAuctionCron };
