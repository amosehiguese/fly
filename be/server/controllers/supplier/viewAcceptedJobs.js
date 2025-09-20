const db = require('../../../db/connect')

exports.viewAcceptedJobs = async (req, res) => {
    const supplierId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // First, get total count for pagination
        const countQuery = `
            SELECT COUNT(DISTINCT ab.order_id) as total
            FROM accepted_bids ab
            JOIN checkout c ON c.order_id = ab.order_id
            WHERE ab.supplier_id = ? AND ab.assignedDriverId IS NULL
        `;

        const [[{ total }]] = await db.promise().query(countQuery, [supplierId]);

        // Main query to fetch basic job details
        const baseQuery = `
            SELECT 
                ab.order_id,
                ab.quotation_id,
                ab.quotation_type,
                c.from_address,
                c.delivery_address,
                b.estimated_pickup_date_from,
                b.estimated_pickup_date_to,
                b.moving_cost,
                ab.created_at as accepted_at
            FROM accepted_bids ab
            JOIN checkout c ON c.order_id = ab.order_id
            JOIN bids b ON b.order_id = ab.order_id
            WHERE ab.supplier_id = ? 
            AND ab.assignedDriverId IS NULL
            ORDER BY ab.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [jobs] = await db.promise().query(baseQuery, [supplierId, parseInt(limit), parseInt(offset)]);

        if (!jobs.length) {
            return res.status(404).json({
                success: false,
                message: "No unassigned jobs found",
                messageSv: "Inga otilldelade jobb hittades"
            });
        }

        // Fetch distances for each job using their respective quotation tables
        const jobsWithDistance = await Promise.all(jobs.map(async job => {
            try {
                const [[distanceResult]] = await db.promise().query(
                    'SELECT distance FROM ?? WHERE id = ?',
                    [job.quotation_type, job.quotation_id]
                );
                
                return {
                    ...job,
                    distance: distanceResult ? distanceResult.distance : 0
                };
            } catch (error) {
                console.error(`Error fetching distance for job ${job.order_id}:`, error);
                return {
                    ...job,
                    distance: 0
                };
            }
        }));

        // Process dates and format response
        const processedJobs = jobsWithDistance.map(job => ({
            orderId: job.order_id,
            quotationDetails: {
                id: job.quotation_id,
                type: job.quotation_type
            },
            locations: {
                pickup: job.from_address,
                delivery: job.delivery_address,
                distance: job.distance || 0
            },
            schedule: {
                pickupFrom: job.estimated_pickup_date_from,
                pickupTo: job.estimated_pickup_date_to
            },
            price: job.moving_cost,
            acceptedAt: new Date(job.accepted_at).toISOString()
        }));

        return res.status(200).json({
            success: true,
            message: "Unassigned jobs retrieved successfully",
            messageSv: "Otilldelade jobb hämtades framgångsrikt",
            data: {
                jobs: processedJobs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalJobs: total,
                    perPage: parseInt(limit),
                    hasNextPage: offset + limit < total,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error in viewAcceptedJobs:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching unassigned jobs",
            messageSv: "Fel vid hämtning av otilldelade jobb",
            error: error.message
        });
    }
};