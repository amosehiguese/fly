const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require('../../../db/connect');

const jwtSecret = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: No Authorization header provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing from Authorization header." });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ error: "Forbidden: Invalid token." });
    }

    req.user = user; // ✅ Attach user data to request
    next();
  });
};

const supplierIsLoggedIn = (req, res, next) => {
  if (req.user && req.user.role === "supplier") {
    return next();
  }
  return res.status(401).json({ error: "Forbidden: Supplier access only." });
};

const userIsLoggedIn = (req, res, next) => {
  if (req.user && req.user.role === "customer") {
    return next();
  }
  return res.status(401).json({ error: "Forbidden: Customer access only." });
};

const driverIsLoggedIn = (req, res, next) => {
  if (req.user && req.user.role === "driver") {
    return next();
  }
  return res.status(401).json({ error: "Forbidden: Driver access only." });
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(401).json({
          error: "Forbidden. You don't have permission to perform this action.",
        });
      }

      req.admin = decoded; // Attach admin details to request
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  };
};



const logAdminActivity = async (
  req,
  adminId,
  action,
  message,
  referenceId = null,
  referenceType = null
) => {
  try {
    const query = `
      INSERT INTO admin_logs (admin_id, admin_username, admin_fullname, role, action, message, reference_id, reference_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      adminId,
      req.admin.username,
      req.admin.fullname,
      req.admin.role,
      action,
      message,
      referenceId,
      referenceType,
    ];

    const [result] = await db.promise().query(query, values);
    return result;
  } catch (error) {
    console.error("Error logging admin activity:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};


module.exports = { authenticateJWT, supplierIsLoggedIn, userIsLoggedIn, checkRole, logAdminActivity, driverIsLoggedIn };
