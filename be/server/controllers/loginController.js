const db = require("../../db/connect");
const bcrypt = require("bcryptjs");

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
        phone,
        password,
        company_name as fullname,
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
          .json({ error: "Internal Server Error: Unable to fetch user data." });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Invalid email/phone number or password.", errorSv: "Ogiltig e-postadress/telefonnummer eller lösenord." });
      }

      const user = results[0];

      // Check supplier registration status
      if (user.role === 'supplier' && user.reg_status !== 'active') {
        return res
          .status(403)
          .json({ error: "Your registration is pending admin approval. Please wait for activation.", errorSv: "Din registrering väntar på administratörens godkännande. Vänligen vänta på aktivering." });
      }

      bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error("Error comparing passwords:", bcryptErr);
          return res
            .status(500)
            .json({
              error: "Internal Server Error: Unable to validate password.",
            });
        }

        if (!isMatch) {
          return res
            .status(401)
            .json({ error: "Invalid email/phone number or password.", errorSv: "Ogiltig e-postadress/telefonnummer eller lösenord." });
        }

        // Set session based on role
        const sessionData = {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
        };

      
        req.session.user = null;
        req.session.supplier = null;

        if (user.role === "supplier") {
          req.session.supplier = sessionData;
        } else {
          req.session.user = sessionData;
        }

        return res.status(200).json({
          message: "Login successful!",
          messageSv: "Inloggning lyckades!",
          user: {
            fullname: user.fullname,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
          },
        });
      });
    }
  );
};

