const { Server } = require('socket.io');
const handlers = require('./handlers');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: (process.env.FRONTEND_URL || "http://localhost:3000"),
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            credentials: true,
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "Connection",
                "Upgrade",
                "Sec-WebSocket-Version",
                "Sec-WebSocket-Key",
                "Sec-WebSocket-Extensions"
            ],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        path: '/socket.io/',
        connectTimeout: 45000,
        maxHttpBufferSize: 1e8,
        allowUpgrades: true,
        perMessageDeflate: {
            threshold: 2048
        },
        cookie: {
            name: 'io',
            path: '/',
            httpOnly: true,
            sameSite: 'lax'
        }
    });

    // Handle connection errors
    io.engine.on("connection_error", (err) => {
        console.error("Connection error:", err);
    });

    // Handle upgrade errors
    io.engine.on("upgrade_error", (err) => {
        console.error("Upgrade error:", err);
    });

    console.log("Socket.IO server initialized.");

    // Register socket event handlers
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);
        let currentDriverId = null;

        // Send immediate acknowledgment
        socket.emit("connected", { 
            status: "connected", 
            socketId: socket.id,
            pingInterval: io.opts.pingInterval,
            pingTimeout: io.opts.pingTimeout
        });

        // Handle connection errors
        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            socket.emit("error_message", { message: "Connection error occurred" });
        });

        // Handle connection timeouts
        socket.on("connect_timeout", (timeout) => {
            console.error("Socket connection timeout:", timeout);
            socket.emit("error_message", { message: "Connection timeout" });
        });

        // Handle ping/pong
        socket.on("ping", () => {
            socket.emit("pong");
        });

        // Global error handler
        socket.on("error", (error) => {
            console.error("Socket encountered an error:", error);
            socket.emit("error_message", { message: "An unexpected socket error occurred." });
        });

        // Register event handlers
        socket.on("identify", async (data) => {
            await handlers.handleUserIdentify(socket, data);
        });

        socket.on("driver:identify", async (data) => {
            currentDriverId = await handlers.handleDriverIdentify(socket, data);
        });

        socket.on("driver:updateLocation", async (data) => {
            await handlers.handleLocationUpdate(socket, data, currentDriverId);
        });

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
            handlers.handleDisconnect(socket, currentDriverId);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO,
    handlers
}; 