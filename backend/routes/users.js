import express from 'express';
import sql from 'mssql';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET pending user promotion requests
router.get('/pending', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    const result = await pool.request().query(`
      SELECT id, first_name, last_name, email, requested_role
      FROM Users
      WHERE status = 'pending'
    `);
    res.json({
      success: true,
      users: result.recordset
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users'
    });
  }
});

// Approve user promotion
router.put('/:id/approve', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    const userResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT requested_role FROM Users WHERE id = @id');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const requested_role = userResult.recordset[0].requested_role;

    await pool.request()
      .input('id', sql.Int, id)
      .input('role', sql.NVarChar, requested_role)
      .query(`
        UPDATE Users
        SET role = @role, status = 'active'
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'User promotion approved'
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user promotion'
    });
  }
});

// Reject user promotion
router.put('/:id/reject', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE Users
        SET status = 'rejected'
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'User promotion rejected'
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user promotion'
    });
  }
});

export default router;
