import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    const result = await pool.request().query('SELECT * FROM Clubs');
    res.json({
      success: true,
      count: result.recordset.length,
      clubs: result.recordset
    });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs'
    });
  }
});

export default router;
