const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const expressSession = require("express-session");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const { getIO } = require("./socket");
const regionBlacklist = require("./server/middleware/regionBlacklist");

const path = require("path");
const cookieParser = require("cookie-parser");
const invoiceService = require("./utils/invoiceService");
const emailService = require("./utils/emailService");
// Import custom modules
const db = require("./db/connect");
const { initializeSocket } = require("./socket");
const {
  schedulePaymentReleases,
} = require("./server/schedulers/paymentScheduler");
const notificationService = require("./utils/notificationService");
const {
  runAuctionCron,
  toggleAuctionCron,
} = require("./server/cron/auctionCron");
const reviewScheduler = require("./server/schedulers/reviewScheduler");

// Load environment variables
dotenv.config();

// Initialize Express and HTTP Server
const app = express();

const allowedOrigins = [
  "https://flyttman.se",
  "https://flyttman.com",
  "http://localhost:3010",
  "http://192.168.0.106:3010",
];

app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
      "Origin",
      "Accept",
    ],
  })
);

app.set("trust proxy", true);

app.use(regionBlacklist);

app.options("*", cors());

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true, // Required for cookies
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// }));

// // Allow preflight requests for all routes
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.sendStatus(200);
// });

// app.use(cookieParser());

// Middleware to manually set headers
// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//   }
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

const server = http.createServer(app);

// Generate a new UUID for session secret
const sessionSecret = uuidv4();

// Middleware Configuration
app.set("trust proxy", 1);

// Middleware Configuration
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         process.env.FRONTEND_URL || "https://flyttman.se",
//       ];

//       if (allowedOrigins.includes(origin) || !origin) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true, // Allows cookies and authorization headers to be sent
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );

// app.use(
//   cors({
//     origin: true, // Allows all origins
//     credentials: true, // Allows cookies and authorization headers to be sent
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );

app.options("*", cors()); // Allow preflight requests for all routes

// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3010"
//   ); // Adjust for your environment
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,POST,PUT,DELETE,PATCH,OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With"
//   );
//   next();
// });

// Add this BEFORE your body parser middleware
app.use((req, res, next) => {
  if (
    req.originalUrl === "/api/webhook/stripe" ||
    req.originalUrl === "/api/webhook/stripe-partial-payment"
  ) {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

// Keep your URL encoded parser
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
    abortOnLimit: true,
  })
);

// Initialize Socket.IO
const io = initializeSocket(server);

// Initialize location sharing socket
const {
  initializeSocket: initializeLocationSharing,
} = require("./server/controllers/drivers/sharingDistance");
initializeLocationSharing();

// API Routes
const customerRoutes = require("./server/routes/customerRoutes");
const adminRoutes = require("./server/routes/adminRoutes");
const quotationRoutes = require("./server/routes/quotationRoutes");
const supplierRoutes = require("./server/routes/supplierRoutes");
const reviewRoutes = require("./server/routes/reviewRoutes");
const supplierRatingsRoutes = require("./server/routes/supplierRatings");
const adminReviewsRoutes = require("./server/routes/adminReviews");
const calendarRoutes = require("./server/routes/calendar");
const adminMessagesRoutes = require("./server/routes/adminMessages");
const customerMessagesRoutes = require("./server/routes/customerMessages");
const notificationRoutes = require("./server/routes/notificationRoutes");
const disputesRouter = require("./server/routes/disputesRoutes");
const adminDisputesRoutes = require("./server/routes/adminDisputeRoutes");
const disputeChatRoutes = require("./server/routes/disputeChatRoutes");
const disputeSupplierChatRoutes = require("./server/routes/supplierChatroute");
const loginRoutes = require("./server/routes/loginRoutes");
const paymentRoutes = require("./server/routes/paymentRoutes");
const webhookRoutes = require("./server/routes/webhookRoutes");
const validateSSN = require("./server/routes/ssnValidationRoutes");
const conversation = require("./server/routes/conversationRoutes");
const supplierAdminChatRoutes = require("./server/routes/supplierAdminRoutes");
const mailing = require("./server/routes/mailingRoutes");
const forgotPassword = require("./server/routes/forgotPassword");
const checkOut = require("./server/routes/adminCheckoutRoutes");
const drivers = require("./server/routes/driversRoute");
const locationSharing = require("./server/routes/locationSharing");
const driverTips = require("./server/routes/tippingRoutes");

// Other routes
app.use("/api/notifications", notificationRoutes);

app.use("/api/supplierRatings", supplierRatingsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/adminReviews", adminReviewsRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/adminmessages", adminMessagesRoutes);
app.use("/api/customermessages", customerMessagesRoutes);
app.use("/api/disputes", disputesRouter);
app.use("/api/admin-dispute", adminDisputesRoutes);
app.use("/api/dispute-chat", disputeChatRoutes);
app.use("/api/dispute-supplier-chat", disputeSupplierChatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api", loginRoutes);
app.use("/api/conversation", conversation);
app.use("/api/supplier-chat", supplierAdminChatRoutes);
app.use("/api/mailing", mailing);
app.use("/api/forgot-password", forgotPassword);
app.use("/api/checkout", checkOut);
app.use("/api/drivers", drivers);
app.use("/api/location", locationSharing);
app.use("/api/tipping", driverTips);

// the route below is still in works
app.use("/api/ssn", validateSSN);

// Serve all upload directories
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "/server/uploads")));

// serve specific upload folders separately:
app.use(
  "/uploads/disputes",
  express.static(path.join(__dirname, "uploads/disputes"))
);
app.use(
  "/uploads/messages",
  express.static(path.join(__dirname, "uploads/messages"))
);
app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "uploads/profiles"))
);
app.use(
  "/uploads/admin-conversations",
  express.static(path.join(__dirname, "uploads/admin-conversations"))
);
app.use(
  "/uploads/conversations",
  express.static(path.join(__dirname, "uploads/conversations"))
);
app.use(
  "/uploads/dispute-chats",
  express.static(path.join(__dirname, "uploads/dispute-chats"))
);
app.use(
  "/uploads/review-evidence",
  express.static(path.join(__dirname, "uploads/review-evidence"))
);
app.use(
  "/uploads/supplier-chats",
  express.static(path.join(__dirname, "uploads/supplier-chats"))
);
app.use(
  "/uploads/customer-admin-messages",
  express.static(path.join(__dirname, "/uploads/customer-admin-messages"))
);
app.use(
  "/uploads/unified-chats",
  express.static(path.join(__dirname, "/server/uploads/unified-chats"))
);

// Start Background Processes
schedulePaymentReleases();
runAuctionCron();
toggleAuctionCron();
reviewScheduler.start();

app.set("trust proxy", true);

// Default Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize NotificationService
notificationService.emitNotification = function (notification) {
  const io = getIO(); // Use the initialized socket instance
  const room = `${notification.recipientType}_${notification.recipientId}`;
  io.to(room).emit("notification", notification);
};
