const db = require('../../../db/connect');
const bcrypt = require('bcryptjs');
const path = require('path');
const emailService = require('../../../utils/emailService');
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");

// Store reset codes in memory
const resetCodes = new Map();

const generateResetCode = () => {
    const letters = "0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        code += letters[randomIndex];
        if (i % 2 === 1 && i !== 5) code += " ";
    }
    return code;
};

// Request password reset with OTP
exports.requestPasswordReset = [
    checkRole(["super_admin", "finance_admin", "support_admin"]),
    async (req, res) => {
    const requestingAdminId = req.admin.id; // Get the ID of the logged-in admin
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
                messageSv: "E-post krävs"
            });
        }

        // Check if admin exists and matches the requesting admin
        const [admin] = await db.promise().query(
            'SELECT id, username, firstname, email FROM admin WHERE email = ? AND id = ?',
            [email, requestingAdminId]
        );

        if (admin.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You can only reset your own password",
                messageSv: "Du kan endast återställa ditt eget lösenord"
            });
        }

        // Generate reset code
        const resetCode = generateResetCode();
        
        // Store code with timestamp and attempts
        resetCodes.set(email, {
            code: resetCode,
            timestamp: Date.now(),
            attempts: 0
        });

        // Send email with reset code
        await emailService.sendEmail(email, {
            subject: 'Admin Password Reset Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="cid:company-logo" 
                                alt="Flyttman Logo" 
                                style="max-width: 200px; height: auto;"
                            />
                        </div>
                        
                        <h2 style="color: #1a365d; margin-bottom: 20px; text-align: center;">Password Reset Code</h2>
                        
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6; text-align: center;">
                            Hello ${admin[0].firstname},<br>
                            Use this code to reset your admin account password:
                        </p>

                        <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #1a365d; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 4px;">
                                ${resetCode}
                            </p>
                        </div>

                        <div style="background-color: #ebf4ff; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #1a365d;">
                            <p style="color: #2c5282; margin: 0; font-size: 14px;">
                                ⏰ This code will expire in 15 minutes.
                            </p>
                        </div>

                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                        
                        <p style="color: #718096; font-size: 12px; text-align: center;">
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                </div>
            `,
            attachments: [{
                filename: "flyttman-logo.png",
                path: path.join(__dirname, "../../../public/images/flyttman-logo.png"),
                cid: "company-logo"
            }]
        });

        // Add activity log
        await logAdminActivity(
            req,
            requestingAdminId,
            "PASSWORD_RESET_REQUEST",
            "Requested password reset code",
            requestingAdminId,
            "password reset"
        );

        res.status(200).json({
            success: true,
            message: "Reset code sent successfully",
            messageSv: "Återställningskod skickad"
        });

    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: "Error sending reset code",
            messageSv: "Fel vid sändning av återställningskod"
        });
    }
}];

// Verify code and reset password
exports.resetPassword = [
checkRole(["super_admin", "finance_admin", "support_admin"]),
    async (req, res) => {
    const requestingAdminId = req.admin.id;
    const { email, code, newPassword } = req.body;

    try {
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, code and new password are required",
                messageSv: "E-post, kod och nytt lösenord krävs"
            });
        }

        // Verify the email belongs to the requesting admin
        const [admin] = await db.promise().query(
            'SELECT id, email, username FROM admin WHERE email = ? AND id = ?',
            [email, requestingAdminId]
        );

        if (admin.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You can only reset your own password",
                messageSv: "Du kan endast återställa ditt eget lösenord"
            });
        }

        const resetData = resetCodes.get(email);

        if (!resetData) {
            return res.status(400).json({
                success: false,
                message: "No reset code found. Please request a new one",
                messageSv: "Ingen återställningskod hittades. Vänligen begär en ny"
            });
        }

        // Check if code has expired (15 minutes)
        if (Date.now() - resetData.timestamp > 15 * 60 * 1000) {
            resetCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: "Reset code has expired. Please request a new one",
                messageSv: "Återställningskoden har gått ut. Vänligen begär en ny"
            });
        }

        // Check attempts
        if (resetData.attempts >= 3) {
            resetCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: "Too many attempts. Please request a new code",
                messageSv: "För många försök. Vänligen begär en ny kod"
            });
        }

        // Increment attempts
        resetData.attempts++;

        // Verify code
        if (code.replace(/\s/g, '') !== resetData.code.replace(/\s/g, '')) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset code",
                messageSv: "Ogiltig återställningskod",
                remainingAttempts: 3 - resetData.attempts
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.promise().query(
            'UPDATE admin SET password = ? WHERE id = ?',
            [hashedPassword, admin[0].id]
        );

        // Clear reset code
        resetCodes.delete(email);

        // Send confirmation email
        await emailService.sendEmail(email, {
            subject: 'Password Reset Successful',
            html: `
                <h2>Password Reset Successful</h2>
                <p>Hello ${admin[0].username},</p>
                <p>Your admin account password has been successfully reset.</p>
                <p>If you did not perform this action, please contact support immediately.</p>
            `
        });

        // Add activity log after successful reset
        await logAdminActivity(
            req,
            requestingAdminId,
            "PASSWORD_RESET_COMPLETE",
            "Successfully reset password",
            requestingAdminId,
            "password reset"
        );

        res.status(200).json({
            success: true,
            message: "Password reset successful",
            messageSv: "Lösenordet har återställts"
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: "Error resetting password",
            messageSv: "Fel vid återställning av lösenord"
        });
    }
}];