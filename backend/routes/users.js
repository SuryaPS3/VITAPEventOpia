import express from 'express';
import sql from 'mssql';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Request promotion
router.put('/request-promotion', authenticateToken, async (req, res) => {
  try {
    const { requested_role } = req.body;
    const pool = req.app.get('dbPool');

    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('requested_role', sql.NVarChar, requested_role)
      .query(`
        UPDATE Users
        SET promotion_request = @requested_role
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'Promotion request submitted successfully'
    });
  } catch (error) {
    console.error('Request promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit promotion request'
    });
  }
});

// GET pending user promotion requests
router.get('/promotion-requests', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    const result = await pool.request().query(`
      SELECT id, first_name, last_name, email, promotion_request
      FROM Users
      WHERE promotion_request IS NOT NULL
    `);
    res.json({
      success: true,
      users: result.recordset
    });
  } catch (error) {
    console.error('Get promotion requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion requests'
    });
  }
});

// Approve user promotion
router.put('/:id/approve-promotion', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    const userResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT promotion_request FROM Users WHERE id = @id');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const promotion_request = userResult.recordset[0].promotion_request;

    await pool.request()
      .input('id', sql.Int, id)
      .input('role', sql.NVarChar, promotion_request)
      .query(`
        UPDATE Users
        SET role = @role, promotion_request = NULL
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'User promotion approved'
    });
  } catch (error) {
    console.error('Approve user promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user promotion'
    });
  }
});

// Reject user promotion
router.put('/:id/reject-promotion', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE Users
        SET promotion_request = NULL
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'User promotion rejected'
    });
  } catch (error) {
    console.error('Reject user promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user promotion'
    });
  }
});

export default router;
