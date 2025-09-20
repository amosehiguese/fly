const db = require("../../db/connect");

const getAdminLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count of logs
    const countQuery = "SELECT COUNT(*) as total FROM admin_logs";
    db.execute(countQuery, (countError, rows) => {
      if (countError) {
        throw countError;
      }

      const totalLogs = rows[0].total;
      const totalPages = Math.ceil(totalLogs / limit);

      // Get paginated logs with user details
      const logsQuery = `
                SELECT al.*, u.username, u.role 
                FROM admin_logs al
                LEFT JOIN admin u ON al.admin_id = u.id
                ORDER BY al.created_at DESC
                LIMIT ? OFFSET ?
            `;

      db.execute(logsQuery, [limit, offset], (logsError, logRows) => {
        if (logsError) {
          throw logsError;
        }

        res.status(200).json({
          success: true,
          currentPage: page,
          totalPages,
          totalLogs,
          logsPerPage: limit,
          data: logRows,
        });
      });
    });
  } catch (error) {
    console.error("Error in getAdminLogs:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving admin logs",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminLogs,
};
