const db = require('../../db/connect');
const { authenticateJWT, userIsLoggedIn, logAdminActivity, checkRole } = require("../controllers/loginController/authMiddleware");




// Dashboard access for all admin roles
const getReviewsDashboard = [
  checkRole(['super_admin', 'support_admin', 'finance_admin']),
  async (req, res) => {
    try {
      // Get basic stats
      const [statsResults] = await db.promise().query(`
        SELECT
          COUNT(*) as total_reviews,
          AVG(satisfaction_rating) as average_rating,
          COUNT(CASE WHEN issues_reported = 1 THEN 1 END) as total_issues,
          COUNT(CASE WHEN damage_reported = 1 THEN 1 END) as total_damages,
          COUNT(CASE WHEN satisfaction_rating <= 2 THEN 1 END) as low_ratings
        FROM reviews
      `);
      const stats = statsResults[0];

      // Add role-specific data
      let additionalData = {};
      if (req.admin.role === 'finance_admin') {
        const [financialResults] = await db.promise().query(`
          SELECT 
            COUNT(CASE WHEN compensation_requested = 1 THEN 1 END) as compensation_requests,
            SUM(CASE WHEN compensation_amount IS NOT NULL THEN compensation_amount ELSE 0 END) as total_compensation
          FROM reviews
        `);
        additionalData = financialResults[0];
      }

      await logAdminActivity(
        req,
        req.admin.id,
        'VIEW_REVIEWS_DASHBOARD',
        'Viewed reviews dashboard',
        null,
        'reviews'
      );

      res.status(200).json({
        stats: {
          ...stats,
          average_rating: parseFloat(stats.average_rating).toFixed(1),
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// Reviews list with role-specific filters
const getAllReviews = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'created_at', 
      order = 'DESC',
      filter_type,
      rating,
      has_issues,
      date_from,
      date_to
    } = req.query;
    
    const offset = (page - 1) * limit;

    try {
      let whereClause = '1=1';
      const params = [];

      // Role-specific filters
      if (req.admin.role === 'support_admin') {
        whereClause += ' AND (r.issues_reported = 1 OR r.satisfaction_rating <= 3)';
      }

      if (filter_type) {
        whereClause += ' AND r.quotation_type = ?';
        params.push(filter_type);
      }

      if (rating) {
        whereClause += ' AND r.satisfaction_rating = ?';
        params.push(rating);
      }

      if (has_issues === 'true') {
        whereClause += ' AND r.issues_reported = 1';
      }

      if (date_from) {
        whereClause += ' AND r.created_at >= ?';
        params.push(date_from);
      }

      if (date_to) {
        whereClause += ' AND r.created_at <= ?';
        params.push(date_to);
      }

      // Get reviews with pagination
      const [reviews] = await db.promise().query(
        `SELECT 
          r.id,
          r.bid_id,
          r.quotation_type,
          r.customer_email,
          r.satisfaction_rating,
          r.feedback_text,
          r.created_at,
          r.evidence_urls,
          b.supplier_id,
          s.company_name as supplier_name,
          ${req.admin.role === 'finance_admin' ? 'r.compensation_amount, r.compensation_status,' : ''}
          GROUP_CONCAT(
            CONCAT(
              '{"type":"', IFNULL(ri.issue_type, ''), 
              '","description":"', IFNULL(ri.description, ''),
              '","status":"', IFNULL(ri.status, ''), '"}'
            )
          ) as issues
        FROM reviews r
        JOIN bids b ON r.bid_id = b.id
        JOIN suppliers s ON b.supplier_id = s.id
        LEFT JOIN review_issues ri ON r.id = ri.review_id
        WHERE ${whereClause}
        GROUP BY r.id
        ORDER BY ${sort} ${order}
        LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );

      // Get total count
      const [countResults] = await db.promise().query(
        `SELECT COUNT(DISTINCT r.id) as total
         FROM reviews r
         WHERE ${whereClause}`,
        params
      );

      const processedReviews = reviews.map(review => ({
        ...review,
        evidence_urls: JSON.parse(review.evidence_urls || '[]'),
        issues: review.issues 
          ? review.issues.split(',').map(issue => {
              try {
                return JSON.parse(issue);
              } catch (e) {
                return null;
              }
            }).filter(Boolean)
          : []
      }));

      await logAdminActivity(
        req,
        req.admin.id,
        'VIEW_REVIEWS',
        `Viewed reviews list with filters: ${JSON.stringify({ filter_type, rating, has_issues, date_from, date_to })}`,
        null,
        'reviews'
      );

      res.status(200).json({
        reviews: processedReviews,
        pagination: {
          total: countResults[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(countResults[0].total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// Issue status updates - Support admin and Super admin only
const updateIssueStatus = [
  checkRole(['super_admin', 'support_admin']),
  async (req, res) => {
    const { issue_id } = req.params;
    const { status, admin_notes } = req.body;
    const admin = req.admin;

    try {
      const [result] = await db.promise().query(
        `UPDATE review_issues 
         SET 
           status = ?,
           admin_notes = ?,
           updated_at = NOW(),
           updated_by = ?,
           updated_by_role = ?
         WHERE id = ?`,
        [status, admin_notes, admin.id, admin.role, issue_id]
      );

      await logAdminActivity(
        req,
        admin.id,
        'UPDATE_ISSUE_STATUS',
        `Updated issue #${issue_id} status to ${status}`,
        issue_id,
        'review_issue'
      );

      res.status(200).json({ 
        message: 'Issue status updated successfully',
        status: status,
        updated_by: {
          admin_id: admin.id,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Error updating issue status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// Issues summary - accessible by all admin roles
const getIssuesSummary = [
  checkRole(['super_admin', 'support_admin', 'finance_admin']),
  async (req, res) => {
    try {
      const [summary] = await db.promise().query(`
        SELECT 
          ri.issue_type,
          COUNT(*) as total_count,
          COUNT(CASE WHEN ri.status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN ri.status = 'in_progress' THEN 1 END) as in_progress_count,
          COUNT(CASE WHEN ri.status = 'resolved' THEN 1 END) as resolved_count,
          ${req.admin.role === 'finance_admin' ? `
            SUM(CASE WHEN r.compensation_requested = 1 THEN 1 ELSE 0 END) as compensation_requests,
            SUM(IFNULL(r.compensation_amount, 0)) as total_compensation,
          ` : ''}
          MAX(ri.updated_at) as last_updated
        FROM review_issues ri
        JOIN reviews r ON ri.review_id = r.id
        GROUP BY ri.issue_type
        ORDER BY total_count DESC
      `);

      await logAdminActivity(
        req,
        req.admin.id,
        'VIEW_ISSUES_SUMMARY',
        'Viewed issues summary',
        null,
        'review_issues'
      );

      res.status(200).json({
        summary,
        role_specific: req.admin.role,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error fetching issues summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

module.exports = {
  getReviewsDashboard,
  getAllReviews,
  updateIssueStatus,
  getIssuesSummary
}; 