const db = require('../../../db/connect');
const bcrypt = require('bcryptjs');

exports.editDriverProfile = async (req, res) => {
    const driverId = req.user.id;
    const {
        phoneNumber,
        email,
        currentPassword,
        newPassword,
    } = req.body;

    try {
        // Get current driver details
        const [currentDriver] = await db.promise().query(
            'SELECT * FROM drivers WHERE id = ?',
            [driverId]
        );

        if (!currentDriver.length) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
                messageSv: "Föraren hittades inte"
            });
        }

        const updateParams = [];
        const updateFields = [];

        // Handle phone number update
        if (phoneNumber) {
            updateFields.push('phone_number = ?');
            updateParams.push(phoneNumber);
        }

        // Handle email update
        if (email) {
            // Check if email is already in use by another driver
            const [existingEmail] = await db.promise().query(
                'SELECT id FROM drivers WHERE email = ? AND id != ?',
                [email, driverId]
            );
            if (existingEmail.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use",
                    messageSv: "E-postadressen används redan"
                });
            }
            updateFields.push('email = ?');
            updateParams.push(email);
        }

        // Handle password change if requested
        if (currentPassword && newPassword) {
            const isValidPassword = await bcrypt.compare(
                currentPassword,
                currentDriver[0].password
            );

            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect",
                    messageSv: "Nuvarande lösenord är felaktigt"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            updateFields.push('password = ?');
            updateParams.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No updates provided",
                messageSv: "Inga uppdateringar tillhandahölls"
            });
        }

        // Perform update
        const updateQuery = `
            UPDATE drivers 
            SET ${updateFields.join(', ')},
                updated_at = NOW()
            WHERE id = ?`;

        updateParams.push(driverId);
        await db.promise().query(updateQuery, updateParams);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            messageSv: "Profilen uppdaterades framgångsrikt"
        });

    } catch (error) {
        console.error('Error updating driver profile:', error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            messageSv: "Fel vid uppdatering av profil",
            error: error.message
        });
    }
};