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
      .input('user_id', sql.Int, req.user.id)
      .input('requested_role', sql.NVarChar, requested_role)
      .query(`
        INSERT INTO PromotionRequests (user_id, requested_role)
        VALUES (@user_id, @requested_role)
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
      SELECT pr.id, u.first_name, u.last_name, u.email, pr.requested_role
      FROM PromotionRequests pr
      JOIN Users u ON pr.user_id = u.id
      WHERE pr.status = 'pending'
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

    const promotionRequestResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT user_id, requested_role FROM PromotionRequests WHERE id = @id');

    if (promotionRequestResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion request not found'
      });
    }

    const { user_id, requested_role } = promotionRequestResult.recordset[0];

    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('role', sql.NVarChar, requested_role)
      .query(`
        UPDATE Users
        SET role = @role
        WHERE id = @user_id
      `);

    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE PromotionRequests
        SET status = 'approved'
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
        UPDATE PromotionRequests
        SET status = 'rejected'
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
