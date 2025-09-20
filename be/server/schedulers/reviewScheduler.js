const cron = require("node-cron");
const db = require("../../db/connect");
const { emailService } = require("../../utils/emailService");

const reviewScheduler = cron.schedule(
  "0 */1 * * *",
  async () => {
    console.log("Running review request scheduler...");

    try {
      const query = `
        SELECT 
          ab.order_id,
          ab.updated_at AS completion_date,
          b.quotation_type,
          CASE b.quotation_type
            WHEN 'company_relocation' THEN cr.email
            WHEN 'moving_cleaning' THEN mc.email
            WHEN 'heavy_lifting' THEN hl.email
            WHEN 'estate_clearance' THEN ec.email
            WHEN 'evacuation_move' THEN em.email
            WHEN 'secrecy_move' THEN sm.email
            WHEN 'private_move' THEN pm.email
          END AS customer_email
        FROM accepted_bids ab
        JOIN bids b ON ab.bid_id = b.id
        LEFT JOIN reviews r ON ab.order_id = r.order_id
        LEFT JOIN company_relocation cr ON b.quotation_id = cr.id AND b.quotation_type = 'company_relocation'
        LEFT JOIN moving_cleaning mc ON b.quotation_id = mc.id AND b.quotation_type = 'moving_cleaning'
        LEFT JOIN heavy_lifting hl ON b.quotation_id = hl.id AND b.quotation_type = 'heavy_lifting'
        LEFT JOIN estate_clearance ec ON b.quotation_id = ec.id AND b.quotation_type = 'estate_clearance'
        LEFT JOIN evacuation_move em ON b.quotation_id = em.id AND b.quotation_type = 'evacuation_move'
        LEFT JOIN secrecy_move sm ON b.quotation_id = sm.id AND b.quotation_type = 'secrecy_move'
        LEFT JOIN private_move pm ON b.quotation_id = pm.id AND b.quotation_type = 'private_move'
        WHERE 
          ab.order_status = 'completed'
          AND TIMESTAMPDIFF(HOUR, ab.updated_at, NOW()) BETWEEN 24 AND 48
          AND r.id IS NULL
      `;

      const [moves] = await db.promise().query(query);

      console.log(`Found ${moves.length} completed moves without reviews.`);

      for (const move of moves) {
        try {
          const emailData = {
            to: move.customer_email,
            subject: "Vänligen recensera din senaste tjänst",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">How was your experience?</h2>
                
                <p>Vi hoppas att din ${move.quotation_type.replace(/_/g, " ")} gick smidigt! Din feedback hjälper oss att upprätthålla hög servicenivå.</p>
                
                <p>Vänligen ta ett ögonblick för att recensera din upplevelse:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL}/review/${move.order_id}" 
                     style="background-color: rgb(37, 46, 38); 
                            color: white; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold;">
                    Lämna Din Recension
                  </a>
                </div>
                
                <p style="color: #666; font-size: 0.9em;">
                  Denna länk kommer att gå ut om 7 dagar. Om du har några problem med att skicka in din recension, vänligen kontakta vårt supportteam.
                </p>
              </div>
            `,
          };

          await emailService.sendEmail(emailData);
          console.log(
            `Review reminder sent successfully to ${move.customer_email} for order ${move.order_id}`
          );
        } catch (error) {
          console.error(
            `Failed to send review reminder for order ${move.order_id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error in review request scheduler:", error);
    }
  },
  {
    scheduled: false,
  }
);

module.exports = reviewScheduler;
