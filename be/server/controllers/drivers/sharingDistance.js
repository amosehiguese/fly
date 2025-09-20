const db = require('../../../db/connect');
const { getIO } = require('../../../socket');

// Store active drivers' locations
const activeDriverLocations = new Map();

// Initialize socket connection handler
const initializeSocket = () => {
    const io = getIO();
    
    io.on('connection', (socket) => {
        let driverId = null;

        // Handle driver location updates
        socket.on('driver:updateLocation', async (data) => {
            try {
                const { latitude, longitude, driverId: id } = data;
                
                if (!id || !latitude || !longitude) {
                    socket.emit('error', { message: 'Missing required location data' });
                    return;
                }

                driverId = id;

                // Update active drivers map
                activeDriverLocations.set(driverId, {
                    latitude,
                    longitude,
                    lastUpdate: new Date(),
                    socketId: socket.id
                });

                // Update database
                await db.promise().query(
                    `UPDATE drivers 
                     SET current_latitude = ?, 
                         current_longitude = ?, 
                         last_location_update = NOW(),
                         is_sharing_location = true
                     WHERE id = ?`,
                    [latitude, longitude, driverId]
                );

                // Notify relevant suppliers
                const [driverInfo] = await db.promise().query(
                    'SELECT supplier_id FROM drivers WHERE id = ?',
                    [driverId]
                );

                if (driverInfo.length > 0) {
                    // Join supplier room
                    socket.join(`supplier:${driverInfo[0].supplier_id}`);
                    
                    // Emit to supplier room
                    io.to(`supplier:${driverInfo[0].supplier_id}`).emit('driver:locationUpdate', {
                        driverId,
                        latitude,
                        longitude,
                        timestamp: new Date()
                    });

                    // Acknowledge successful update
                    socket.emit('location:updated', {
                        success: true,
                        message: 'Location updated successfully'
                    });
                } else {
                    socket.emit('error', { message: 'Driver not associated with any supplier' });
                }
            } catch (error) {
                console.error('Error updating driver location:', error);
                socket.emit('error', { message: 'Failed to update location' });
            }
        });

        // Handle driver identification
        socket.on('driver:identify', async (data) => {
            try {
                const { driverId: id } = data;
                if (!id) {
                    socket.emit('error', { message: 'Driver ID is required' });
                    return;
                }

                // Verify driver exists
                const [driver] = await db.promise().query(
                    'SELECT id, supplier_id FROM drivers WHERE id = ?',
                    [id]
                );

                if (driver.length > 0) {
                    driverId = id;
                    socket.join(`driver:${id}`);
                    if (driver[0].supplier_id) {
                        socket.join(`supplier:${driver[0].supplier_id}`);
                    }
                    socket.emit('driver:identified', { success: true, driverId: id });
                } else {
                    socket.emit('error', { message: 'Driver not found' });
                }
            } catch (error) {
                console.error('Error identifying driver:', error);
                socket.emit('error', { message: 'Failed to identify driver' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`Driver disconnected: ${socket.id}, reason: ${reason}`);
            if (driverId) {
                activeDriverLocations.delete(driverId);
                // Notify supplier about driver disconnection
                io.to(`supplier:${driverId}`).emit('driver:disconnected', { driverId });
            }
        });
    });
};

// Driver controller to start sharing location
const driverLongAndLat = async (req, res) => {
    const driverId = req.user.id;
    const { latitude, longitude } = req.body;

    try {
        // Validate coordinates
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required",
                messageSv: "Latitud och longitud krävs"
            });
        }

        // Update driver's location
        await db.promise().query(
            `UPDATE drivers 
             SET current_latitude = ?, 
                 current_longitude = ?, 
                 last_location_update = NOW(),
                 is_sharing_location = true
             WHERE id = ?`,
            [latitude, longitude, driverId]
        );

        // Store in active drivers map
        activeDriverLocations.set(driverId, {
            latitude,
            longitude,
            lastUpdate: new Date()
        });

        res.status(200).json({
            success: true,
            message: "Location sharing started",
            messageSv: "Platsdelning startad"
        });
    } catch (error) {
        console.error('Error in driverLongAndLat:', error);
        res.status(500).json({
            success: false,
            message: "Error updating location",
            messageSv: "Fel vid uppdatering av plats"
        });
    }
};

// Supplier controller to view driver locations
const getDriverLocations = async (req, res) => {
    const supplierId = req.user.id;

    try {
        const [drivers] = await db.promise().query(
            `SELECT 
                d.id,
                d.full_name,
                d.current_latitude,
                d.current_longitude,
                d.last_location_update,
                d.is_sharing_location,
                d.vehicle_type
             FROM drivers d
             WHERE d.supplier_id = ? 
             AND d.is_sharing_location = true
             AND d.last_location_update >= NOW() - INTERVAL 15 MINUTE`,
            [supplierId]
        );

        // Enhance with real-time data if available
        const enhancedDrivers = drivers.map(driver => {
            const realtimeData = activeDriverLocations.get(driver.id);
            return {
                ...driver,
                current_latitude: realtimeData?.latitude || driver.current_latitude,
                current_longitude: realtimeData?.longitude || driver.current_longitude,
                last_update: realtimeData?.lastUpdate || driver.last_location_update,
                is_online: !!realtimeData
            };
        });

        res.status(200).json({
            success: true,
            message: "Driver locations retrieved successfully",
            messageSv: "Förarplatser hämtades framgångsrikt",
            data: enhancedDrivers
        });
    } catch (error) {
        console.error('Error in getDriverLocations:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching driver locations",
            messageSv: "Fel vid hämtning av förarplatser"
        });
    }
};

module.exports = {
    initializeSocket,
    driverLongAndLat,
    getDriverLocations
};