const bcrypt = require("bcryptjs");
const db = require("../../../db/connect");
const emailService = require("../../../utils/emailService");
const path = require("path");
const { error } = require("console");

const forgotPasswordCodes = new Map();

// Generate random verification code using 6 letters
const generateVerificationCode = () => {
  const letters = "0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    code += letters[randomIndex];

    // Add a space after every two characters except the last pair
    if (i % 2 === 1 && i !== 5) code += " ";
  }

  return code;
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const stored = forgotPasswordCodes.get(email);

  if (!stored || stored.code !== code) {
    return res
      .status(400)
      .json({
        error: "Invalid or expired code",
        errorSv: "Ogiltig eller utgången kod",
      });
  }

  const now = Date.now();
  if (now - stored.timestamp > 15 * 60 * 1000) {
    forgotPasswordCodes.delete(email);
    return res
      .status(400)
      .json({ error: "Code has expired", errorSv: "Koden har gått ut" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // First try updating customers
    const [updateCustomer] = await db
      .promise()
      .query("UPDATE customers SET password = ? WHERE email = ?", [
        hashedPassword,
        email,
      ]);

    if (updateCustomer.affectedRows === 0) {
      // Then try suppliers
      const [updateSupplier] = await db
        .promise()
        .query("UPDATE suppliers SET password = ? WHERE email = ?", [
          hashedPassword,
          email,
        ]);

      if (updateSupplier.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Account not found", errorSv: "Konto hittades inte" });
      }
    }

    // Clear the code
    forgotPasswordCodes.delete(email);

    res
      .status(200)
      .json({
        message: "Password reset successfully",
        messageSv: "Lösenordet har återställts framgångsrikt",
      });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({
        error: "Failed to reset password",
        errorSv: "Misslyckades med att återställa lösenordet",
      });
  }
};

exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check in customers
    const [customerResult] = await db
      .promise()
      .query("SELECT id FROM customers WHERE email = ?", [email]);

    // Check in suppliers if not found in customers
    const [supplierResult] =
      customerResult.length === 0
        ? await db
            .promise()
            .query("SELECT id FROM suppliers WHERE email = ?", [email])
        : [[]];

    if (customerResult.length === 0 && supplierResult.length === 0) {
      return res.status(404).json({
        error: "No account found with that email. Please create an account.",
        errorSv:
          "Inget konto hittades med den e-postadressen. Vänligen skapa ett konto.",
      });
    }

    const code = generateVerificationCode(); // e.g., 6-digit random
    forgotPasswordCodes.set(email, {
      code,
      timestamp: Date.now(),
    });

    await emailService.sendEmail(email, {
      subject: "Återställ ditt Flyttman-lösenord",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="cid:company-logo" 
                   alt="Flyttman Logo" 
                   style="max-width: 200px; height: auto;"
              />
            </div>
            
            <h2 style="color: #1a365d; margin-bottom: 20px; text-align: center;">Begäran om återställning av lösenord</h2>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
              Vi har mottagit en begäran om att återställa ditt lösenord. Vänligen använd följande verifieringskod:
            </p>
    
            <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #1a365d; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 4px;">
                ${code}
              </p>
            </div>
    
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #856404;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⚠️ Om du inte begärde denna lösenordsåterställning, vänligen ignorera detta mejl eller kontakta supporten om du är orolig.
              </p>
            </div>
    
            <div style="background-color: #ebf4ff; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #1a365d;">
              <p style="color: #2c5282; margin: 0; font-size: 14px;">
                ⏰ Denna kod kommer att gå ut om 15 minuter. Koden är skiftlägeskänslig.
              </p>
            </div>
    
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            
            <p style="color: #718096; font-size: 12px; text-align: center;">
              Detta är ett automatiserat meddelande från Flyttman. Vänligen svara inte på detta mejl.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "flyttman-logo.png",
          path: path.join(
            __dirname,
            "../../../public/images/flyttman-logo.png"
          ),
          cid: "company-logo",
        },
      ],
    });

    res.status(200).json({ message: "Verification code sent!", messageSv: "Verifieringskod skickad!" });
  } catch (error) {
    console.error("Error sending forgot password code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
