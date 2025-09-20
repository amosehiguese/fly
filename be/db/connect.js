const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the pool connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Stop the app if DB connection fails
  } else {
    console.log('Connected to the MySQL database pool.');
    connection.release();
  }
});


module.exports = db;
