const db = require('../../db/connect');

// Store active connections
const activeConnections = new Map();
const activeDriverLocations = new Map();

// Handle driver identification
const handleDriverIdentify = async (socket, data) => {
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
            socket.join(`driver:${id}`);
            if (driver[0].supplier_id) {
                socket.join(`supplier:${driver[0].supplier_id}`);
            }
            socket.emit('driver:identified', { success: true, driverId: id });
            return id; // Return driverId for connection tracking
        } else {
            socket.emit('error', { message: 'Driver not found' });
            return null;
        }
    } catch (error) {
        console.error('Error identifying driver:', error);
        socket.emit('error', { message: 'Failed to identify driver' });
        return null;
    }
};

// Handle location updates
const handleLocationUpdate = async (socket, data, driverId) => {
    try {
        const { latitude, longitude } = data;
        
        if (!driverId || !latitude || !longitude) {
            socket.emit('error', { message: 'Missing required location data' });
            return;
        }

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
            socket.to(`supplier:${driverInfo[0].supplier_id}`).emit('driver:locationUpdate', {
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
};

// Handle user identification
const handleUserIdentify = async (socket, data) => {
    try {
        const { email } = data;
        if (!email) {
            socket.emit('error_message', { message: 'Email is required' });
            return;
        }

        const query = `
            SELECT 'customers' AS type, id, email FROM customers WHERE email = ?
            UNION
            SELECT 'admin' AS type, id, email, role FROM admins WHERE email = ?
        `;

        const [results] = await db.promise().query(query, [email, email]);

        if (results.length > 0) {
            const user = results[0];
            if (user.type === 'admin') {
                socket.join(`admin_${user.id}`);
                activeConnections.set(socket.id, {
                    type: 'admin',
                    id: user.id,
                    email: user.email,
                });
                socket.emit('identified', { type: 'admin', id: user.id });
                console.log(`Admin ${user.id} connected.`);
            } else if (user.type === 'customer') {
                socket.join(`customer_${user.email}`);
                activeConnections.set(socket.id, {
                    type: 'customer',
                    id: user.id,
                    email: user.email,
                });
                socket.emit('identified', { type: 'customer', id: user.id });
                console.log(`Customer ${user.email} connected.`);
            }
        } else {
            socket.emit('error_message', { message: 'User not found.' });
            console.log('User not found in database:', email);
        }
    } catch (error) {
        console.error('Error in identify handler:', error);
        socket.emit('error_message', { message: 'Error processing identification' });
    }
};

// Handle disconnection
const handleDisconnect = (socket, driverId) => {
    console.log(`Client disconnected: ${socket.id}`);
    if (driverId) {
        activeDriverLocations.delete(driverId);
        socket.to(`supplier:${driverId}`).emit('driver:disconnected', { driverId });
    }
    const user = activeConnections.get(socket.id);
    if (user) {
        console.log(
            `${user.type} disconnected: ${
                user.type === 'admin' ? user.id : user.email
            }`
        );
        activeConnections.delete(socket.id);
    }
};

// Get active driver locations
const getActiveDriverLocations = (supplierId) => {
    return Array.from(activeDriverLocations.entries())
        .filter(([_, data]) => data.supplierId === supplierId)
        .map(([driverId, data]) => ({
            driverId,
            ...data
        }));
};

module.exports = {
    handleDriverIdentify,
    handleLocationUpdate,
    handleUserIdentify,
    handleDisconnect,
    getActiveDriverLocations,
    activeConnections,
    activeDriverLocations
}; 