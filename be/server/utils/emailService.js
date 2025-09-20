const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, { subject, html, attachments = [] }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    attachments: attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

const templates = {
  reviewRequest: ({ bidId, serviceType, reviewLink }) => ({
    subject: `Hur var din upplevelse av ${serviceType}?`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Your Feedback Matters!</h2>
        <p>Vi hoppas att din senaste ${serviceType} gick smidigt.</p>
        <p>Skulle du kunna ta ett ögonblick och dela med dig av din upplevelse? Det tar bara en minut!</p>
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
        <p>Din feedback hjälper oss att upprätthålla höga servicenivåer och hjälper andra kunder att fatta välgrundade beslut.</p>
        <p>Tack för att du valde vår plattform!</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };
