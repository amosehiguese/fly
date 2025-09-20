const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../../db/connect"); // Adjust the path as needed
require("dotenv").config();
const { logAdminActivity } = require("./authMiddleware");

const jwtSecret = process.env.JWT_SECRET;

exports.login = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: "Both identifier and password are required." });
  }

  const query = `
    SELECT 
      id, 
      email, 
      phone_num as phone_number, 
      password, 
      fullname,
      'customer' as role,
      NULL as reg_status
    FROM customers 
    WHERE email = ? OR phone_num = ?
    UNION ALL
    SELECT 
      id, 
      email, 
      phone as phone_number, 
      password, 
      fullname,
      'supplier' as role,
      reg_status
    FROM suppliers 
    WHERE email = ? OR phone = ?
  `;

  db.query(
    query,
    [identifier, identifier, identifier, identifier],
    (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error: Database query failed." });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Invalid email/phone number or password." });
      }

      const user = results[0];

      // Check supplier's registration status
      if (user.role === "supplier" && user.reg_status === "pending") {
        return res.status(403).json({
          error:
            "Your account is pending approval. Please wait for admin verification before logging in.",
          errorSv:
            "Ditt konto väntar på godkännande. Vänligen vänta på administratörens verifiering innan du loggar in.",
        });
      }

      bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error("Error comparing passwords:", bcryptErr);
          return res.status(500).json({
            error: "Internal Server Error: Password comparison failed.",
          });
        }

        if (!isMatch) {
          return res
            .status(401)
            .json({
              error: "Invalid email/phone number or password.",
              errorSv: "Ogiltig e-post/telefonnummer eller lösenord.",
            });
        }

        try {
          // Generate JWT Token
          const token = jwt.sign(
            {
              id: user.id,
              fullname: user.fullname,
              email: user.email,
              phone_number: user.phone_number,
              role: user.role,
            },
            jwtSecret,
            { expiresIn: "7d" }
          );

          return res
            .status(200)
            .json({ message: "Login successful!", token, user });
        } catch (jwtErr) {
          console.error("Error generating JWT:", jwtErr);
          return res
            .status(500)
            .json({ error: "Internal Server Error: JWT generation failed." });
        }
      });
    }
  );
};

// exports.login = (req, res) => {
//   const { identifier, password } = req.body;

//   if (!identifier || !password) {
//     return res
//       .status(400)
//       .json({ error: "Both identifier and password are required." });
//   }

//   const query = `
//     SELECT
//       id,
//       email,
//       phone_num as phone_number,
//       password,
//       fullname,
//       'customer' as role
//     FROM customers
//     WHERE email = ? OR phone_num = ?
//     UNION ALL
//     SELECT
//       id,
//       email,
//       phone as phone_number,
//       password,
//       fullname,
//       'supplier' as role
//     FROM suppliers
//     WHERE email = ? OR phone = ?
//   `;

//   db.query(
//     query,
//     [identifier, identifier, identifier, identifier],
//     (err, results) => {
//       if (err) {
//         console.error("Error querying the database:", err);
//         return res
//           .status(500)
//           .json({ error: "Internal Server Error: Unable to fetch user data." });
//       }

//       if (results.length === 0) {
//         return res
//           .status(404)
//           .json({ error: "Invalid email/phone number or password." });
//       }

//       const user = results[0];
//       bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
//         if (bcryptErr) {
//           console.error("Error comparing passwords:", bcryptErr);
//           return res.status(500).json({
//             error: "Internal Server Error: Unable to validate password.",
//           });
//         }

//         if (!isMatch) {
//           return res
//             .status(401)
//             .json({ error: "Invalid email/phone number or password." });
//         }

//         // Generate JWT Token
//         const token = jwt.sign(
//           {
//             id: user.id,
//             fullname: user.fullname,
//             email: user.email,
//             phone_number: user.phone_number,
//             role: user.role,
//           },
//           jwtSecret,
//           { expiresIn: "7d" }
//         );

//         return res.status(200).json({
//           message: "Login successful!",
//           token,
//           user: {
//             fullname: user.fullname,
//             email: user.email,
//             phone_number: user.phone_number,
//             role: user.role,
//           },
//         });
//       });
//     }
//   );
// };

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Both username and password are required." });
  }

  try {
    const query = `
      SELECT id, username, password, role, firstname, lastname, phone_number, email
      FROM admin 
      WHERE username = ?
    `;

    const [results] = await db.promise().query(query, [username]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Invalid username or password." });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Attach admin details to req.admin
    req.admin = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      fullname: `${admin.firstname} ${admin.lastname}`,
      phonenumber: admin.phone_number,
      email: admin.email,
    };

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 24 hours
    );

    // Log activity using req.admin
    await logAdminActivity(
      req,
      admin.id,
      "LOGIN",
      `Admin ${admin.username} logged in successfully`
    );

    return res.status(200).json({
      message: "Login successful!",
      token, // Send JWT token to frontend
      admin: req.admin, // Send attached admin details
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.driversLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Both email and password are required." });
  }

  db.query(
    "SELECT * FROM drivers WHERE email = ? AND is_active = true AND is_verified = true",
    [email],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ error: "Internal Server Error: Database query failed." });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({
            error:
              "Invalid email or password, or your account has been deactivated if you've created an account already before",
            errorSv:
              "Ogiltig e-postadress eller lösenord, eller så har ditt konto inaktiverats om du redan har skapat ett konto.",
          });
      }

      const driver = results[0];

      bcrypt.compare(password, driver.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error("Error comparing passwords:", bcryptErr);
          return res.status(500).json({
            error: "Internal Server Error: Unable to validate password.",
          });
        }

        if (!isMatch) {
          return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate JWT Token
        const token = jwt.sign(
          {
            id: driver.id,
            fullname: driver.full_name,
            email: driver.email,
            phone_number: driver.phone_number,
            role: "driver",
          },
          jwtSecret,
          { expiresIn: "7d" }
        );

        return res.status(200).json({
          message: "Login successful!",
          token,
          user: {
            id: driver.id,
            fullname: driver.full_name,
            email: driver.email,
            phone_number: driver.phone_number,
            role: "driver",
          },
        });
      });
    }
  );
};
