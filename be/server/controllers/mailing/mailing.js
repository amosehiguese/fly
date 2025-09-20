const path = require("path");
const emailService = require("../../../utils/emailService");
const db = require("../../../db/connect");

const BASE_DIR = path.resolve(__dirname, "../../..");
const LOGO_PATH = path.join(BASE_DIR, "public", "images", "flyttman-logo.png");

const verificationCodes = new Map();

// Generate random verification code using all the alphabets
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

// Send verification email
exports.sendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Check if email exists in any user table
    const checkEmailQuery = `
      SELECT email FROM admin WHERE email = ?
      UNION ALL
      SELECT email FROM customers WHERE email = ?
      UNION ALL
      SELECT email FROM suppliers WHERE email = ?
    `;

    const [results] = await db
      .promise()
      .query(checkEmailQuery, [email, email, email]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Email not found. Please create an account first with your email.",
        messageSv:
          "E-postadress hittades inte. Vänligen skapa ett konto först med din e-postadress.",
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    // console.log("code", verificationCode);
    // Store the code with timestamp (expires in 15 minutes)
    verificationCodes.set(email, {
      code: verificationCode,
      timestamp: Date.now(),
      attempts: 0,
    });

    // Send email using emailService
    await emailService.sendEmail(email, {
      subject: "Din verifieringskod",
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
            
            <h2 style="color: #1a365d; margin-bottom: 20px; text-align: center;">Verifiering krävs</h2>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
              Vänligen använd följande verifieringskod:
            </p>
    
            <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #1a365d; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 4px;">
                ${verificationCode}
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

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
      messageSv: "Verifieringskod skickad!",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
      messageSv: "Misslyckades med att skicka verifieringskod",
    });
  }
};

// Verify the code
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
        messageSv: "E-postadress och verifieringskod krävs",
      });
    }

    const verificationData = verificationCodes.get(email);

    if (!verificationData) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new one",
        messageSv: "Ingen verifieringskod hittades. Vänligen begär en ny",
      });
    }

    // Check if code has expired (15 minutes)
    if (Date.now() - verificationData.timestamp > 15 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one",
        messageSv: "Verifieringskoden har gått ut. Vänligen begär en ny",
      });
    }

    // Check attempts
    if (verificationData.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: "Too many attempts. Please request a new verification code",
        messageSv: "För många försök. Vänligen begär en ny verifieringskod",
      });
    }

    // Increment attempts
    verificationData.attempts++;

    // Check if code matches
    if (code.toLowerCase() !== verificationData.code.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
        messageSv: "Ogiltig verifieringskod",
        remainingAttempts: 3 - verificationData.attempts,
      });
    }

    // Success! Remove the code from storage
    verificationCodes.delete(email);

    res.status(200).json({
      success: true,
      message: "Verification successful",
      messageSv: "Verifiering lyckades",
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      messageSv: "Verifiering misslyckades",
    });
  }
};
