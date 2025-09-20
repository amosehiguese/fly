// Required .env variables:
// SENDGRID_API_KEY=your_sendgrid_api_key
// EMAIL_SENDER_NAME=Flyttman AB
// EMAIL_SENDER_ADDRESS=your_verified_sendgrid_sender@example.com

const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(
      sgTransport({
        apiKey: process.env.SENDGRID_API_KEY,
      })
    );

    // Initialize transporter verification
    this.verifyConnection();
  }

  // Verify email connection on startup
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("Email service is ready");
    } catch (error) {
      console.error("Email service verification failed:", error);
    }
  }

  // Email templates
  templates = {
    // Template for customer when payment is initiated
    paymentInitiated: (data) => {
      // Ensure amount is a number
      const amount = Number(data.amount);
      if (isNaN(amount)) {
        console.error("Invalid amount provided:", data.amount);
        throw new Error("Invalid amount provided");
      }

      return {
        subject: `Betalning initierad för ${data.quotationType} - Bud #${data.bidId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">Betalningsbekräftelse</h2>
            
            <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <p>Bästa ${data.customerName},</p>
              
              <p>Din betalning har framgångsrikt initierats för din ${
                data.quotationType
              } tjänst.</p>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Bid ID:</strong> #${
                  data.bidId
                }</p>
                <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0;"><strong>Service:</strong> ${
                  data.quotationType
                }</p>
                <p style="margin: 5px 0;"><strong>Supplier:</strong> ${
                  data.supplierName
                }</p>
                <p style="margin: 5px 0;"><strong>Escrow Release Date:</strong> ${
                  data.escrowReleaseDate
                }</p>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="margin: 10px 0;">✓ Din betalning hålls säkert i escrow</li>
                <li style="margin: 10px 0;">✓ Leverantören kommer att meddelas att fortsätta med tjänsten</li>
                <li style="margin: 10px 0;">✓ Betalningen kommer att släppas till leverantören efter ${
                  data.escrowReleaseDate
                }</li>
              </ul>

              <p style="margin-top: 20px;">Om du har några frågor eller funderingar, tveka inte att kontakta vårt supportteam.</p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px;">Tack för att du valde vår tjänst!</p>
              <p style="color: #666; font-size: 14px;">
                ${process.env.EMAIL_SENDER_NAME}<br>
                <a href="${
                  process.env.WEBSITE_URL
                }" style="color: #007bff; text-decoration: none;">Besök vår webbplats</a>
              </p>
            </div>
          </div>
        `,
      };
    },

    // Template for withdrawal requests
    withdrawalRequest: (data) => {
      // Ensure amount is a number
      const amount = Number(data.amount);
      if (isNaN(amount)) {
        console.error("Invalid amount provided:", data.amount);
        throw new Error("Invalid amount provided");
      }

      return {
        subject: `Begäran om uttag inlämnad - Referens: ${data.withdrawalId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">Begäran om uttag inlämnad</h2>
            
            <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <p>Dear ${data.supplierName},</p>
              
              <p>Din begäran om uttag har skickats in framgångsrikt.</p>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Referens:</strong> ${
                  data.withdrawalId
                }</p>
                <p style="margin: 5px 0;"><strong>Belopp:</strong> $${amount.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0;"><strong>Banknamn:</strong> ${
                  data.bankName
                }</p>
                <p style="margin: 5px 0;"><strong>IBAN:</strong> ${
                  data.iban
                }</p>
              </div>

              <p><strong>Vad händer härnäst?</strong></p>
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="margin: 10px 0;">✓ Din begäran kommer att granskas av vårt team.</li>
                <li style="margin: 10px 0;">✓ Behandlingen tar vanligtvis 2–3 arbetsdagar.</li>
                <li style="margin: 10px 0;">✓ Du kommer att få en bekräftelse när överföringen är klar.</li>
              </ul>

              <p style="margin-top: 20px;">Om du har några frågor eller funderingar, tveka inte att kontakta vårt supportteam.</p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px;">Tack för att du använder vår tjänst!</p>
              <p style="color: #666; font-size: 14px;">
                ${process.env.EMAIL_SENDER_NAME}<br>
                <a href="${
                  process.env.WEBSITE_URL
                }" style="color: #007bff; text-decoration: none;">Visit Our Website</a>
              </p>
            </div>
          </div>
        `,
      };
    },

    // Template for supplier when payment is initiated
    paymentInitiatedSupplier: (data) => {
      // Ensure amount is a number
      const amount = Number(data.amount);
      if (isNaN(amount)) {
        console.error("Invalid amount provided:", data.amount);
        throw new Error("Invalid amount provided");
      }

      return {
        subject: `Bud Godkänt - ${data.quotationType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">Meddelande om Budgodkännande</h2>
            
            <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
              <p>Bäste Leverantör,</p>
              
              <p>Ditt bud har godkänts!</p>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Bid ID:</strong> #${
                  data.bidId
                }</p>
                <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(
                  2
                )}</p>
                <p style="margin: 5px 0;"><strong>Tjänst:</strong> ${
                  data.quotationType
                }</p>
                <p style="margin: 5px 0;"><strong>Utgivningsdatum:</strong> ${
                  data.releaseDate
                }</p>
              </div>
              
              <p>Vänligen logga in på ditt konto för att se de fullständiga detaljerna.</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px;">Tack för att du använder vår plattform!</p>
            </div>
          </div>
        `,
      };
    },

    // Template for payment release notification
    paymentRelease: (data) => ({
      subject: `Betalning Släppt - Bud #${data.bidId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Meddelande om Betalningssläpp</h2>
          
          <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
            <p>Hej,</p>
            
            <p>Goda nyheter! Betalningen för din tjänst har släppts från escrow.</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Bud-ID:</strong> #${
                data.bidId
              }</p>
              <p style="margin: 5px 0;"><strong>Belopp:</strong> $${data.amount.toFixed(
                2
              )}</p>
              <p style="margin: 5px 0;"><strong>Utgivningsdatum:</strong> ${
                data.releaseDate
              }</p>
            </div>

            <p>Betalningen bör synas på ditt konto inom 1-3 arbetsdagar.</p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666; font-size: 14px;">Tack för att du använder vår plattform!</p>
            <p style="color: #666; font-size: 14px;">
              ${process.env.EMAIL_SENDER_NAME}<br>
              <a href="${
                process.env.WEBSITE_URL
              }" style="color: #007bff; text-decoration: none;">Besök vår webbplats</a>
            </p>
          </div>
        </div>
      `,
    }),

    // Auction - Supplier Wins Notification
    auctionWonSupplier: (data) => ({
      subject: `Grattis! Du har vunnit auktionen - ${data.quotationType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Meddelande om Vunnen Auktion</h2>
          
          <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
            <p>Dear ${data.supplierName},</p>
            
            <p>Grattis! Du har vunnit auktionen för ${
              data.quotationType
            } (ID: ${data.quotationId}).</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Bud ID:</strong> #${
                data.bidId
              }</p>
              <p style="margin: 5px 0;"><strong>Slutpris:</strong> $${data.finalPrice.toFixed(
                2
              )}</p>
              <p style="margin: 5px 0;"><strong>Tjänst:</strong> ${
                data.quotationType
              }</p>
              <p style="margin: 5px 0;"><strong>Escrow-utlösningsdatum:</strong> ${
                data.escrowReleaseDate
              }</p>
            </div>
            
            <p>Vänligen fortsätt med tjänsten enligt avtalet. Tack för att du deltog i auktionen!</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666; font-size: 14px;">Thank you for using our platform!</p>
          </div>
        </div>
      `,
    }),

    // Auction - Customer Notification
    auctionCompletedCustomer: (data) => ({
      subject: `Auktion Slutförd - ${data.quotationType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Auktion Slutförd</h2>
          
          <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin: 20px 0;">
            <p>Kära kund,</p>
            
            <p>Auktionen för din ${data.quotationType} (ID: ${
        data.quotationId
      }) har slutförts framgångsrikt.</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Vinnande Bud:</strong> $${data.bidPrice.toFixed(
                2
              )}</p>
              <p style="margin: 5px 0;"><strong>Leverantörens Namn:</strong> ${
                data.supplierName
              }</p>
              <p style="margin: 5px 0;"><strong>Tjänst:</strong> ${
                data.quotationType
              }</p>
              <p style="margin: 5px 0;"><strong>Escrow-utlösningsdatum:</strong> ${
                data.escrowReleaseDate
              }</p>
            </div>
            
            <p>Leverantören kommer att meddelas att fortsätta med tjänsten. Tack för att du använder vår plattform!</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #666; font-size: 14px;">Tack för att du litar på våra tjänster!</p>
          </div>
        </div>
      `,
    }),

    reviewRequest: ({ bidId, serviceType, reviewLink }) => ({
      subject: `Hur var din upplevelse av ${serviceType}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Din Feedback Är Viktig!</h2>
          <p>Vi hoppas att din senaste ${serviceType} gick smidigt.</p>
          <p>Kan du ta ett ögonblick och dela din upplevelse? Det tar bara en minut!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewLink}" style="
              background-color: #4CAF50;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
            ">
              Betygsätt Din Upplevelse
            </a>
          </div>
          <p>Din feedback hjälper oss att upprätthålla höga servicenivåer och hjälper andra kunder att fatta informerade beslut.</p>
          <p>Tack för att du valde vår plattform!</p>
        </div>
      `,
    }),

    // Invoice template specifically for sending invoices
    invoiceEmail: (data) => {
      const hasRUT = data.taxDeduction && data.taxDeduction > 0;
      const prepayLabel = "Boka betala (20%)";
      const onDeliveryLabel = "Att betala vid leverans (80%)";
      const attBetalaLabel = "Att betala";
      const totalsummaLabel = "Totala";
      const rutAvdragLabel = "RUT-avdrag";
      const ovrigaTjansterLabel = "Övriga tjänster";

      // Calculate values for table
      const summa = data.movingCost + data.truckCost + data.additionalServices;
      const attBetala = hasRUT ? summa - data.taxDeduction : summa;
      const rutValue = hasRUT ? data.taxDeduction : 0;

      return {
        subject: `Faktura #${data.invoiceNumber} - ${data.service}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="text-align: left; vertical-align: top;">
                        <img src="cid:company-logo" alt="Flyttman Logo" style="width: 70px; height: auto;">
                      </td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #f7f9fc; border-radius: 8px; padding: 25px; margin: 20px 0; border-left: 4px solid #33658a;">
                    <p style="margin: 15px 0 25px; line-height: 1.5;">
                      Bästa ${data.customerName || "Customer"},
                    </p>
                    
                    <p style="margin: 0 0 20px; line-height: 1.5;">
                      Tack för att du valde Flyttman för dina flyttbehov. Vänligen hitta bifogad faktura för de begärda tjänsterna.
                    </p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fff; border-radius: 5px; overflow: hidden;">
                      <tr style="background-color: #33658a; color: white;">
                        <th style="padding: 12px 15px; text-align: left;">Tjänstdetaljer</th>
                        <th style="padding: 12px 15px; text-align: right;">Belopp</th>
                      </tr>
                      <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                          <strong>Flyttkostnad</strong>
                        </td>
                        <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #eee;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(data.movingCost)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                          <strong>Lastbil, drift</strong>
                        </td>
                        <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #eee;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(data.truckCost)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                          <strong>${ovrigaTjansterLabel}</strong>
                        </td>
                        <td style="padding: 12px 15px; text-align: right; border-bottom: 1px solid #eee;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(data.additionalServices)}
                        </td>
                      </tr>
                      <tr style="background-color: #f7f9fc;">
                        <td style="padding: 12px 15px; text-align: right;"><strong>${totalsummaLabel}:</strong></td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: bold;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(summa)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 15px; text-align: right;"><strong>${rutAvdragLabel}:</strong></td>
                        <td style="padding: 12px 15px; text-align: right;">
                          -${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(rutValue)}
                        </td>
                      </tr>
                      <tr style="background-color: #f7f9fc;">
                        <td style="padding: 12px 15px; text-align: right;"><strong>${attBetalaLabel}:</strong></td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: bold;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(attBetala)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 15px; text-align: right;"><strong>${prepayLabel}:</strong></td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: bold;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(data.initialPayment)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 15px; text-align: right;"><strong>${onDeliveryLabel}:</strong></td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: bold;">
                          ${new Intl.NumberFormat("sv-SE", {
                            style: "currency",
                            currency: "SEK",
                          }).format(data.remainingPayment)}
                        </td>
                      </tr>
                    </table>

                    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 25px 0;">
                      <p style="margin: 0; color: #33658a; font-weight: 600;">Betalningsinstruktioner:</p>
                      <ul style="margin: 10px 0 0; padding-left: 20px; color: #444;">
                        <li>BANKGIRO: 5480-7516</li>
                        <li>SWISH: 1234698353</li>
                        <li>Referens: Faktura #${data.invoiceNumber}</li>
                      </ul>
                    </div>

                    <div style="text-align: left; margin: 30px 0;">
                      <a href="https://flyttman.se/customer/payment/${
                        data.orderId
                      }?bid_id=${data.bidId}" 
                         style="background-color: #4CAF50; 
                                color: white; 
                                padding: 14px 62px; 
                                text-decoration: none; 
                                display: inline-block; 
                                font-size: 16px; 
                                font-weight: bold; 
                                border-radius: 4px; 
                                text-align: center;">
                        BETALA NU
                      </a>
                    </div>

                    <p style="text-align: center; font-size: 13px; color: #666;">
                      Eller kopiera denna länk till din webbläsare:<br>
                      <a href="https://flyttman.se/customer/payment/${
                        data.orderId
                      }?bid_id=${
          data.bidId
        }" style="color: #33658a; word-break: break-all;">
                        https://flyttman.se/customer/payment/${
                          data.orderId
                        }?bid_id=${data.bidId}
                      </a>
                    </p>

                    <p style="margin: 25px 0 0; line-height: 1.5;">
                      Vänligen slutför förskottsbetalningen för att vi ska kunna påbörja din flyttjänst. Fakturan är bifogad i detta mejl för din dokumentation.
                    </p>
                  </div>

                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Tack för att du valde Flyttman AB</p>
                    <p style="margin: 5px 0 0; font-size: 12px; color: #999;">
                      Götgatan 50, 118 26 Stockholm, Sweden<br>
                      <a href="https://flyttman.se" style="color: #33658a; text-decoration: none;">flyttman.se</a> | <a href="mailto:support@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a>
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        `,
      };
    },

    // Simplified quote email template for customers
    quoteEmail: (data) => {
      return {
        subject: `Faktura #${data.invoiceNumber} - ${data.service}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://flyttman.se/images/flyttman-logo.png" alt="Flyttman Logo" style="height: 60px; margin-bottom: 20px;"/>
              <h1 style="color: #33658a; margin: 0; font-size: 24px;">Uppskattad offert för din flytt</h1>
            </div>
            
            <div style="background-color: #f7f9fc; border-radius: 8px; padding: 25px; margin: 20px 0; border-left: 4px solid #33658a;">
              <p style="margin: 0 0 20px; line-height: 1.6; font-size: 16px;">
                Hej ${data.customerName},
              </p>
              
              <p style="margin: 0 0 25px; line-height: 1.6; font-size: 16px;">
                Den uppskattade offerten för din flytt är <strong>${data.estimatedAmount} SEK</strong>.
              </p>
              
              <p style="margin: 0 0 30px; line-height: 1.6; font-size: 16px;">
                Klicka på knappen nedan för att acceptera eller avvisa erbjudandet.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.paymentUrl}" 
                   style="background-color: #4CAF50; 
                          color: white; 
                          padding: 16px 40px; 
                          text-decoration: none; 
                          display: inline-block; 
                          font-size: 18px; 
                          font-weight: bold; 
                          border-radius: 6px; 
                          text-align: center;
                          box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);">
                  FÖRSKOTTSBETALNING 20% FÖR ATT BOKA
                </a>
              </div>
              
              <p style="margin: 25px 0 0; line-height: 1.6; font-size: 14px; color: #666;">
                Genom att klicka på knappen ovan accepterar du erbjudandet och kan slutföra din förskottsbetalning på 20% för att boka tjänsten.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 14px;">Tack för att du valde Flyttman AB</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #999;">
                Götgatan 50, 118 26 Stockholm, Sverige<br>
                <a href="https://flyttman.se" style="color: #33658a; text-decoration: none;">flyttman.se</a> | <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a>
              </p>
            </div>
          </div>
        `,
      };
    },
    // Template for customer account creation with login credentials
    customerAccountCreated: (data) => {
      return {
        subject: "Tack för din offertförfrågan hos Flyttman!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f7f9fc; border-radius: 8px; border: 1px solid #e3e8ee;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://flyttman.se/images/flyttman-logo.png" alt="Flyttman Logo" style="height: 60px; margin-bottom: 8px;"/>
              <h2 style="color: #33658a; margin: 0;">Tack för din förfrågan!</h2>
            </div>
            <div style="background: #fff; border-radius: 6px; padding: 20px; box-shadow: 0 2px 8px rgba(51,101,138,0.04);">
              <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Kära ${data.customerName},</p>
              <p style="font-size: 15px; color: #333; margin-bottom: 18px;">
                Tack för att du skickade in en offertförfrågan på Flyttman!<br>
                Vi har tagit emot din förfrågan och våra leverantörer kommer att kontakta dig med erbjudanden så snart som möjligt.
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #33658a;">
                <h3 style="color: #33658a; margin: 0 0 15px; font-size: 18px;">🔐 Dina inloggningsuppgifter</h3>
                <p style="font-size: 14px; color: #333; margin-bottom: 12px;">
                  Ett konto har skapats automatiskt för dig. Använd följande uppgifter för att logga in:
                </p>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <p style="margin: 8px 0; font-size: 14px;"><strong>E-postadress:</strong> <span style="color: #33658a; font-family: monospace;">${data.email}</span></p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Lösenord:</strong> <span style="color: #33658a; font-family: monospace;">${data.phoneNumber}</span></p>
                </div>
                <p style="font-size: 13px; color: #666; margin-top: 12px; font-style: italic;">
                  💡 Tips: Du kan ändra ditt lösenord när du loggar in på din profil.
                </p>
              </div>
              
              <div style="background-color: #ebf4ff; border-radius: 6px; padding: 15px; margin: 20px 0; border-left: 4px solid #1a365d;">
                <p style="color: #2c5282; margin: 0; font-size: 14px;">
                  <strong>Viktigt:</strong> Spara denna information på en säker plats. Du behöver dessa uppgifter för att logga in och hantera dina offerter.
                </p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://flyttman.se/login" 
                   style="background-color: #33658a; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          display: inline-block; 
                          font-size: 16px; 
                          font-weight: bold; 
                          border-radius: 6px; 
                          text-align: center;
                          box-shadow: 0 2px 4px rgba(51,101,138,0.3);">
                  Logga in på ditt konto
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 24px;">Har du frågor eller behöver hjälp? Kontakta oss gärna på <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a>.</p>
            </div>
            <div style="text-align: center; margin-top: 32px; color: #999; font-size: 13px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Flyttman AB &mdash; Alla rättigheter förbehållna.</p>
              <p style="margin: 4px 0 0;">Götgatan 50, 118 26 Stockholm, Sverige | <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a></p>
            </div>
          </div>
        `,
      };
    },
    // Template for existing customers submitting new quotes
    customerQuoteSubmitted: (data) => {
      return {
        subject: "Tack för din offertförfrågan hos Flyttman!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f7f9fc; border-radius: 8px; border: 1px solid #e3e8ee;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://flyttman.se/images/flyttman-logo.png" alt="Flyttman Logo" style="height: 60px; margin-bottom: 8px;"/>
              <h2 style="color: #33658a; margin: 0;">Tack för din förfrågan!</h2>
            </div>
            <div style="background: #fff; border-radius: 6px; padding: 20px; box-shadow: 0 2px 8px rgba(51,101,138,0.04);">
              <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Kära ${data.customerName},</p>
              <p style="font-size: 15px; color: #333; margin-bottom: 18px;">
                Tack för att du skickade in en ny offertförfrågan på Flyttman!<br>
                Vi har tagit emot din förfrågan och våra leverantörer kommer att kontakta dig med erbjudanden så snart som möjligt.
              </p>
              
              <div style="background-color: #ebf4ff; border-radius: 6px; padding: 15px; margin: 20px 0; border-left: 4px solid #1a365d;">
                <p style="color: #2c5282; margin: 0; font-size: 14px;">
                  <strong>Viktigt:</strong> Du kan logga in på ditt konto för att se alla dina offerter och hantera dina förfrågningar.
                </p>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://flyttman.se/login" 
                   style="background-color: #33658a; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          display: inline-block; 
                          font-size: 16px; 
                          font-weight: bold; 
                          border-radius: 6px; 
                          text-align: center;
                          box-shadow: 0 2px 4px rgba(51,101,138,0.3);">
                  Logga in på ditt konto
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 24px;">Har du frågor eller behöver hjälp? Kontakta oss gärna på <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a>.</p>
            </div>
            <div style="text-align: center; margin-top: 32px; color: #999; font-size: 13px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Flyttman AB &mdash; Alla rättigheter förbehållna.</p>
              <p style="margin: 4px 0 0;">Götgatan 50, 118 26 Stockholm, Sverige | <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a></p>
            </div>
          </div>
        `,
      };
    },
  };

  // Send email function
  async sendEmail(to, template, attachments = []) {
    try {
      // Check if recipient is defined
      if (!to) {
        console.error("Email recipient is undefined or empty");
        return { success: false, error: "No recipient defined" };
      }

      const result = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_SENDER_NAME || "Flyttman AB"}" <${
          process.env.EMAIL_SENDER_ADDRESS
        }>`,
        to,
        subject: template.subject,
        html: template.html,
        attachments: attachments || [],
      });

      console.log(`Email sent successfully to ${to}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      if (error.response && error.response.body && error.response.body.errors) {
        console.error(
          "SendGrid errors:",
          JSON.stringify(error.response.body.errors, null, 2)
        );
      }
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();
module.exports = emailService;
