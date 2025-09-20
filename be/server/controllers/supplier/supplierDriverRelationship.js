const db = require("../../../db/connect");

exports.getSupplierDrivers = (req, res) => {
  const supplierId = req.user.id; 
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Get total count of drivers
  db.query(
    "SELECT COUNT(*) as total FROM drivers WHERE supplier_id = ?",
    [supplierId],
    (countErr, countResults) => {
      if (countErr) {
        console.error("Error counting drivers:", countErr);
        return res.status(500).json({
          success: false,
          message: "Error fetching drivers count",
          messageSv: "Fel vid hämtning av förarantal"
        });
      }

      const totalDrivers = countResults[0].total;
      const totalPages = Math.ceil(totalDrivers / limit);

      // Get drivers data
      db.query(
        `SELECT 
          id,
          full_name,
          email,
          phone_number,
          vehicle_type,
          is_active,
          is_verified,
          created_at
        FROM drivers 
        WHERE supplier_id = ? 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
        [supplierId, limit, offset],
        (err, drivers) => {
          if (err) {
            console.error("Error fetching drivers:", err);
            return res.status(500).json({
              success: false,
              message: "Error fetching drivers",
              messageSv: "Fel vid hämtning av förare"
            });
          }

          res.status(200).json({
            success: true,
            data: {
              drivers,
              pagination: {
                currentPage: page,
                totalPages,
                totalDrivers,
                perPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
              }
            }
          });
        }
      );
    }
  );
};

exports.getSupplierDriversById = (req, res) => {
    const driverId = req.params.driverId;
    const supplierId = req.user.id;
    
    db.query(
        'SELECT supplier_id FROM drivers WHERE id = ?',
        [driverId],
        (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error checking driver:", checkErr);
                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    messageSv: "Databasfel"
                });
            }

            if (checkResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Driver ID does not exist",
                    messageSv: "Förar-ID existerar inte"
                });
            }

            if (checkResult[0].supplier_id !== supplierId) {
                return res.status(403).json({
                    success: false,
                    message: "This driver belongs to another supplier",
                    messageSv: "Denna förare tillhör en annan leverantör"
                });
            }

            // If we get here, the driver exists and belongs to the supplier
            // Modified query to include proof of delivery information
            db.query(
                `SELECT 
                    d.id,
                    d.full_name,
                    d.email,
                    d.phone_number,
                    d.license_image,
                    d.vehicle_type,
                    d.is_active,
                    d.is_verified,
                    d.created_at,
                    (
                        SELECT COUNT(*) 
                        FROM proof_of_delivery pod 
                        WHERE pod.driver_id = d.id
                    ) as total_deliveries,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'order_id', pod.order_id,
                                'delivery_image', pod.delivery_image,
                                'signature_image', pod.signature_image,
                                'delivery_notes', pod.delivery_notes,
                                'created_at', pod.created_at
                            )
                        )
                        FROM proof_of_delivery pod 
                        WHERE pod.driver_id = d.id
                        ORDER BY pod.created_at DESC
                        LIMIT 5
                    ) as recent_deliveries
                FROM drivers d
                WHERE d.id = ? AND d.supplier_id = ?`,
                [driverId, supplierId],
                (err, results) => {
                    if (err) {
                        console.error("Error fetching driver details:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Error fetching driver details",
                            messageSv: "Fel vid hämtning av förardetaljer"
                        });
                    }

                    const driver = results[0];
                    
                    // Parse the JSON string of recent deliveries if it exists
                    if (driver && driver.recent_deliveries) {
                        try {
                            driver.recent_deliveries = JSON.parse(driver.recent_deliveries);
                        } catch (e) {
                            driver.recent_deliveries = [];
                        }
                    } else {
                        driver.recent_deliveries = [];
                    }

                    res.status(200).json({
                        success: true,
                        data: {
                            ...driver,
                            deliveryStats: {
                                totalDeliveries: driver.total_deliveries,
                                recentDeliveries: driver.recent_deliveries
                            }
                        }
                    });
                }
            );
        }
    );
};