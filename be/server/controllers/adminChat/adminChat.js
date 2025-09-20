const db = require("../../../db/connect");
const bcrypt = require("bcryptjs");
const notificationService = require("../../../utils/notificationService");
const emailService = require("../../../utils/emailService");
const { format, differenceInCalendarMonths, addMonths } = require("date-fns");
const { check, validationResult } = require("express-validator");
const {
  authenticateJWT,
  userIsLoggedIn,
  logAdminActivity,
  checkRole,
} = require("../../controllers/loginController/authMiddleware");
const invoiceService = require("../../../utils/invoiceService");
const path = require("path");