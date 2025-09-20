const path = require("path");
const fs = require("fs");
const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const emailService = require("../../../utils/emailService");
const notificationService = require("../../../utils/notificationService");
const {
  authenticateJWT,
  supplierIsLoggedIn,
} = require("../../controllers/loginController/authMiddleware");
const dotenv = require("dotenv");
dotenv.config();


