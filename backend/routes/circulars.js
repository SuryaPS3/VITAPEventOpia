
import express from 'express';
import sql from 'mssql';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== GET ALL CIRCULARS ====================
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    const result = await pool.request().query('SELECT * FROM Circulars');
    res.json({ success: true, circulars: result.recordset });
  } catch (error) {
    console.error('Get circulars error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch circulars' });
  }
});

// ==================== GET SINGLE CIRCULAR ====================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Circulars WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Circular not found' });
    }

    res.json({ success: true, circular: result.recordset[0] });
  } catch (error) {
    console.error('Get circular error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch circular' });
  }
});

// ==================== CREATE CIRCULAR ====================
router.post('/', authenticateToken, authorize('admin', 'club_faculty'), async (req, res) => {
  try {
    const { title, content, target_audience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    const pool = req.app.get('dbPool');
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('created_by', sql.Int, req.user.id)
      .input('target_audience', sql.NVarChar, target_audience)
      .query(`
        INSERT INTO Circulars (title, content, created_by, target_audience)
        OUTPUT INSERTED.*
        VALUES (@title, @content, @created_by, @target_audience)
      `);

    res.status(201).json({ success: true, message: 'Circular created successfully', circular: result.recordset[0] });
  } catch (error) {
    console.error('Create circular error:', error);
    res.status(500).json({ success: false, message: 'Failed to create circular' });
  }
});

// ==================== UPDATE CIRCULAR ====================
router.put('/:id', authenticateToken, authorize('admin', 'club_faculty'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target_audience } = req.body;

    const pool = req.app.get('dbPool');
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('target_audience', sql.NVarChar, target_audience)
      .query(`
        UPDATE Circulars
        SET title = @title, content = @content, target_audience = @target_audience
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Circular not found' });
    }

    res.json({ success: true, message: 'Circular updated successfully', circular: result.recordset[0] });
  } catch (error) {
    console.error('Update circular error:', error);
    res.status(500).json({ success: false, message: 'Failed to update circular' });
  }
});

// ==================== DELETE CIRCULAR ====================
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Circulars WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Circular not found' });
    }

    res.json({ success: true, message: 'Circular deleted successfully' });
  } catch (error) {
    console.error('Delete circular error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete circular' });
  }
});

export default router;
