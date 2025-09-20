const db = require('../../../db/connect');

exports.getDriverProfile = async (req, res) => {
    const driverId = req.user.id;

    try {
        // Get driver basic info and calculate completion rate
        const query = `
            SELECT 
                d.id,
                d.full_name,
                d.email,
                d.phone_number,
                d.vehicle_type,
                d.license_image,
                d.is_active,
                d.is_verified,
                d.created_at,
                ROUND(AVG(r.rating), 1) as average_rating,
                COUNT(DISTINCT r.id) as total_ratings,
                (
                    SELECT COUNT(*) 
                    FROM proof_of_delivery pod 
                    WHERE pod.driver_id = d.id
                ) as completed_deliveries,
                (
                    SELECT COUNT(*) 
                    FROM accepted_bids ab 
                    WHERE ab.assignedDriverId = d.id
                ) as total_assignments,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'rating', r2.rating,
                            'comment', r2.feedback_text,
                            'created_at', r2.created_at
                        )
                    )
                    FROM reviews r2 
                    WHERE r2.driver_id = d.id
                    ORDER BY r2.created_at DESC
                    LIMIT 5
                ) as recent_ratings
            FROM drivers d
            LEFT JOIN reviews r ON d.id = r.driver_id
            WHERE d.id = ?
            GROUP BY d.id`;

        const [profile] = await db.promise().query(query, [driverId]);

        if (!profile.length) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found",
                messageSv: "Förarprofilen hittades inte"
            });
        }

        const driverProfile = profile[0];

        // Calculate completion rate
        const completionRate = driverProfile.total_assignments > 0
            ? (driverProfile.completed_deliveries / driverProfile.total_assignments) * 100
            : 0;

        // Parse recent ratings if they exist
        let recentRatings = [];
        try {
            recentRatings = JSON.parse(driverProfile.recent_ratings || '[]');
        } catch (e) {
            console.error('Error parsing recent ratings:', e);
        }

        // Format response
        const response = {
            personalInfo: {
                id: driverProfile.id,
                fullName: driverProfile.full_name,
                email: driverProfile.email,
                phoneNumber: driverProfile.phone_number,
                licenseType: driverProfile.license_type,
                vehicleType: driverProfile.vehicle_type,
                plateNumber: driverProfile.plate_number,
                licenseExpDate: driverProfile.license_exp_date,
                isActive: driverProfile.is_active,
                isVerified: driverProfile.is_verified,
                joinedAt: driverProfile.created_at
            },
            performanceMetrics: {
                completedDeliveries: driverProfile.completed_deliveries,
                totalAssignments: driverProfile.total_assignments,
                completionRate: parseFloat(completionRate.toFixed(1)),
                averageRating: driverProfile.average_rating || 0,
                totalRatings: driverProfile.total_ratings || 0
            },
            recentRatings: recentRatings
        };

        res.status(200).json({
            success: true,
            message: "Driver profile retrieved successfully",
            messageSv: "Förarprofilen hämtades framgångsrikt",
            data: response
        });

    } catch (error) {
        console.error('Error fetching driver profile:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving driver profile",
            messageSv: "Fel vid hämtning av förarprofil",
            error: error.message
        });
    }
};

exports.getAssignedSupplier = async (req, res) => {
    const driverId = req.user.id;

    try {
        const query = `
            SELECT 
                s.id as supplier_id,
                s.company_name,
                s.email as supplier_email,
                s.phone as supplier_phone,
                d.created_at as registration_date
            FROM drivers d
            JOIN suppliers s ON d.supplier_id = s.id
            WHERE d.id = ?`;

        const [supplierDetails] = await db.promise().query(query, [driverId]);

        if (!supplierDetails.length) {
            return res.status(404).json({
                success: false,
                message: "No supplier found for this driver",
                messageSv: "Ingen leverantör hittades för denna förare"
            });
        }

        res.status(200).json({
            success: true,
            message: "Supplier details retrieved successfully",
            messageSv: "Leverantörsuppgifter hämtades framgångsrikt",
            data: {
                supplierId: supplierDetails[0].supplier_id,
                companyName: supplierDetails[0].company_name,
                email: supplierDetails[0].supplier_email,
                phoneNumber: supplierDetails[0].supplier_phone,
                registeredAt: supplierDetails[0].registration_date
            }
        });

    } catch (error) {
        console.error('Error fetching supplier details:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving supplier details",
            messageSv: "Fel vid hämtning av leverantörsuppgifter",
            error: error.message
        });
    }
};