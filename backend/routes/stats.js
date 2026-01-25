import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET system stats
router.get('/', authenticateToken, authorize('department_head', 'admin'), async (req, res) => {
  try {
    const pool = req.app.get('dbPool');

    const queries = {
      totalEventsThisMonth: "SELECT COUNT(*) as total FROM Events WHERE EXTRACT(MONTH FROM event_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM event_date) = EXTRACT(YEAR FROM CURRENT_DATE)",
      activeUsers: "SELECT COUNT(*) as total FROM Users WHERE is_active = true",
      totalBudgetAllocated: "SELECT SUM(CAST(REPLACE(fee, '₹', '') AS INT)) as total FROM Events WHERE fee LIKE '₹%'",
      pendingApprovals: "SELECT COUNT(*) as total FROM Events WHERE status = 'pending'",
      totalStudents: "SELECT COUNT(*) as total FROM Users WHERE role = 'club_member'",
      facultyMembers: "SELECT COUNT(*) as total FROM Users WHERE role = 'club_faculty'"
    };

    const stats = {};
    for (const key in queries) {
      const result = await pool.query(queries[key]);
      stats[key] = result.rows[0].total;
    }

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system stats'
    });
  }
});

// GET recent decisions
router.get('/recent-decisions', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    const result = await pool.query(`
      SELECT
        e.id,
        e.title as eventTitle,
        ea.approval_status as decision,
        ea.approval_date as date,
        e.fee as budget,
        c.name as club,
        ea.comments as reason
      FROM EventApprovals ea
      JOIN Events e ON ea.event_id = e.id
      JOIN Clubs c ON e.club_id = c.id
      ORDER BY ea.approval_date DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      count: result.rows.length,
      decisions: result.rows
    });
  } catch (error) {
    console.error('Get recent decisions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent decisions'
    });
  }
});

export default router;
