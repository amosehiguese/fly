const cron = require("node-cron");
const db = require("../../db/connect");
const emailService = require("../../utils/emailService");
const notificationService = require("../../utils/notificationService");

const schedulePaymentReleases = () => {
  cron.schedule("0 * * * *", async () => { // Runs every hour
    console.log("Running payment release scheduler...");

    try {
      const query = `
        SELECT 
          ab.bid_id,
          ab.final_price,  -- The total price for admin reference
          b.moving_cost,   -- The amount the supplier gets paid
          ab.updated_at, 
          s.email AS supplier_email,
          s.company_name AS supplier_name
        FROM accepted_bids ab
        JOIN bids b ON ab.bid_id = b.id  -- Fetch moving_cost from bids table
        JOIN suppliers s ON b.supplier_id = s.id
        WHERE 
          ab.order_status = 'completed'
          AND TIMESTAMPDIFF(DAY, ab.updated_at, NOW()) >= 5
      `;

      const payments = await db.promise().query(query);
      const paymentRecords = payments[0];

      if (paymentRecords.length === 0) {
        console.log("No completed orders eligible for payment release.");
        return;
      }

      for (const payment of paymentRecords) {
        try {
          // Notify the supplier via email (show only moving cost)
          await emailService.sendEmail(
            payment.supplier_email,
            {
              subject: `Betalningsmeddelande för Bud #${payment.bid_id}`,
              html: `
                <p>Kära ${payment.supplier_name},</p>
                <p>Escrow-perioden för ditt bud #${payment.bid_id} har avslutats.</p>
                <p><strong>Belopp att betala: $${payment.moving_cost.toFixed(2)}</p>
                <p>Du kommer att få din betalning snart. Vänligen kontakta supporten om du har några frågor.</p>
                <p>Med vänliga hälsningar,<br>Din Plattform</p>
              `,
            }
          );

          // Notify the admin via email (show total final price & moving cost)
          await emailService.sendEmail(
            process.env.ADMIN_EMAIL,
            {
              subject: `Manual Payment Required for Bid #${payment.bid_id}`,
              html: `
                <p>Dear Admin,</p>
                <p>The escrow period for Bid #${payment.bid_id} has ended.</p>
                <p><strong>Supplier:</strong> ${payment.supplier_name}</p>
                <p><strong>Total Price (Customer Paid):</strong> $${payment.final_price.toFixed(2)}</p>
                <p><strong>Supplier Payout:</strong> $${payment.moving_cost.toFixed(2)}</p>
                <p>Please proceed to manually disburse the payment to the supplier.</p>
                <p>Best regards,<br>Flyttman</p>
              `,
            }
          );

          console.log(`Notification emails sent for bid ${payment.bid_id}.`);

          // In-app notifications
          await notificationService.createNotification({
            recipientId: payment.supplier_email,
            recipientType: "supplier",
            title: "Escrow-perioden har avslutats",
            message: `Escrow-perioden för din betalning på $${payment.moving_cost.toFixed(2)} för Bud #${payment.bid_id} har avslutats. Du kommer att få din betalning snart.`,
            type: "payment",
            referenceId: payment.bid_id,
            referenceType: "bid",
          });

          await notificationService.createNotification({
            recipientId: "admin",
            recipientType: "admin",
            title: "Manual Payment Required",
            message: `The escrow period for Bid #${payment.bid_id} has ended. Please proceed to disburse $${payment.moving_cost.toFixed(
              2
            )} to the supplier (${payment.supplier_name}). The customer paid $${payment.final_price.toFixed(2)} in total.`,
            type: "payment",
            referenceId: payment.bid_id,
            referenceType: "bid",
          });

          console.log(`In-app notifications sent for bid ${payment.bid_id}.`);
        } catch (error) {
          console.error(`Error processing bid ${payment.bid_id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in payment release scheduler:", error);
    }
  });
};

module.exports = { schedulePaymentReleases };
