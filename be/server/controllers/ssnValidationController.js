const axios = require('axios');
const db = require('../../db/connect');

const validateAndUpdateRUT = async (req, res) => {
    const { ssn, quotation_type, quotation_id } = req.body;
    const connection = await db.promise();

    if (!ssn || !quotation_type || !quotation_id) {
        return res.status(400).json({
            error: "Social security number, quotation type and ID are required"
        });
    }

    try {
        await connection.beginTransaction();

        // Validate SSN using personnummer.dev API
        const response = await axios.get(`https://personnummer.dev/validate/${ssn}`);
        
        if (!response.data.valid) {
            await connection.rollback();
            return res.status(400).json({
                error: "Invalid Swedish social security number"
            });
        }

        // Get table name based on quotation type
        const tableName = quotation_type === 'local_move' || 
                         quotation_type === 'long_distance_move' || 
                         quotation_type === 'moving_abroad' 
            ? 'moving_service' 
            : quotation_type;

        // Verify quotation exists
        const [quotation] = await connection.query(
            `SELECT id FROM ${tableName} WHERE id = ?`,
            [quotation_id]
        );

        if (!quotation || quotation.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                error: "Quotation not found"
            });
        }

        // Update quotation with RUT status
        await connection.query(
            `UPDATE ${tableName}
             SET has_rut = true,
                 ssn = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [ssn, quotation_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "RUT status updated successfully",
            details: {
                ssn_valid: true,
                ssn_masked: `${ssn.substring(0, 8)}****`,
                quotation_id,
                quotation_type,
                has_rut: true,
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error validating SSN or updating RUT status:', error);
        
        res.status(500).json({
            error: "Failed to validate SSN or update RUT status",
            details: error.message,
            quotation_type,
            quotation_id
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    validateAndUpdateRUT
};