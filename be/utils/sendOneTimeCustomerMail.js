require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const emailService = require('./emailService');

const recipients = [
  'johannes@ljud.org',
  'rasikamaduwanthi95@gmail.com',
  'rayanlolpop2@gmail.com',
];

const customerTemplate = {
  subject: "Tack för din offertförfrågan hos Flyttman!",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f7f9fc; border-radius: 8px; border: 1px solid #e3e8ee;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://flyttman.se/images/flyttman-logo.png" alt="Flyttman Logo" style="height: 60px; margin-bottom: 8px;"/>
        <h2 style="color: #33658a; margin: 0;">Tack för din förfrågan!</h2>
      </div>
      <div style="background: #fff; border-radius: 6px; padding: 20px; box-shadow: 0 2px 8px rgba(51,101,138,0.04);">
        <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Kära Kund,</p>
        <p style="font-size: 15px; color: #333; margin-bottom: 18px;">
          Tack för att du skickade in en offertförfrågan på Flyttman!<br>
          Vi har tagit emot din förfrågan och våra leverantörer kommer att kontakta dig med erbjudanden så snart som möjligt.
        </p>
        <p style="font-size: 15px; color: #333; margin-bottom: 18px;">
          <strong>Inloggningsinformation:</strong><br>
          Om du har problem med att logga in på plattformen, använd <strong>din e-postadress</strong> och <strong>det telefonnummer</strong> du angav vid offertförfrågan som inloggningsuppgifter.
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 24px;">Har du frågor eller behöver hjälp? Kontakta oss gärna på <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a>.</p>
      </div>
      <div style="text-align: center; margin-top: 32px; color: #999; font-size: 13px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Flyttman AB &mdash; Alla rättigheter förbehållna.</p>
        <p style="margin: 4px 0 0;">Götgatan 50, 118 26 Stockholm, Sverige | <a href="mailto:info@flyttman.se" style="color: #33658a; text-decoration: none;">info@flyttman.se</a></p>
      </div>
    </div>
  `
};

(async () => {
  for (const email of recipients) {
    try {
      await emailService.sendEmail(email, customerTemplate);
      console.log(`Mail sent to ${email}`);
    } catch (e) {
      console.error(`Failed to send mail to ${email}:`, e);
    }
  }
  process.exit(0);
})(); 