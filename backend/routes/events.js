import express from 'express';
import sql from 'mssql';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== TEST ENDPOINT ====================
// Must be BEFORE /:id route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Events routes working!' });
});


// Debug - check Events table structure
router.get('/schema', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    
    const result = await pool.request().query(`
      SELECT TOP 5 * FROM Events
    `);
    
    res.json({
      success: true,
      count: result.recordset.length,
      events: result.recordset
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ==================== GET ALL EVENTS ====================
// Public endpoint - anyone can view events
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    const { status, category, search } = req.query;

    let query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.event_time,
        e.venue,
        e.fee,
        e.expected_attendees,
        e.status,
        e.created_at,
        c.name as club_name,
        u.first_name + ' ' + u.last_name as created_by_name
      FROM Events e
      LEFT JOIN Clubs c ON e.club_id = c.id
      LEFT JOIN Users u ON e.created_by = u.id
      WHERE 1=1
    `;

    const request = pool.request();

    // Filter by status
    if (status) {
      query += ' AND e.status = @status';
      request.input('status', sql.NVarChar, status);
    }

    // Filter by category
    if (category) {
      query += ' AND e.category = @category';
      request.input('category', sql.NVarChar, category);
    }

    // Search by title or description
    if (search) {
      query += ' AND (e.title LIKE @search OR e.description LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ' ORDER BY e.event_date DESC';

    const result = await request.query(query);

    res.json({
      success: true,
      count: result.recordset.length,
      events: result.recordset
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// ==================== GET SINGLE EVENT ====================
// Public endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          e.*,
          c.name as club_name,
          c.club_email,
          u.first_name + ' ' + u.last_name as created_by_name,
          u.email as created_by_email,
          (SELECT COUNT(*) FROM EventRegistrations WHERE event_id = e.id AND status = 'registered') as registered_count
        FROM Events e
        LEFT JOIN Clubs c ON e.club_id = c.id
        LEFT JOIN Users u ON e.created_by = u.id
        WHERE e.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: result.recordset[0]
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

// ==================== CREATE EVENT ====================
// Protected - faculty and admin only
router.post('/', authenticateToken, authorize('club_faculty', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      event_date,
      event_time,
      venue,
      fee,
      expected_attendees,
      club_id
    } = req.body;

    // Validation
    if (!title || !event_date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, event_date, and venue'
      });
    }

    const pool = req.app.get('dbPool');

    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || null)
      .input('category', sql.NVarChar, category || 'General')
      .input('event_date', sql.Date, event_date)
      .input('event_time', sql.Time, event_time || '10:00:00')
      .input('venue', sql.NVarChar, venue)
      .input('fee', sql.NVarChar, fee || 'Free')
      .input('expected_attendees', sql.Int, expected_attendees || 50)
      .input('club_id', sql.Int, club_id || null)
      .input('created_by', sql.Int, req.user.id)
      .input('status', sql.NVarChar, 'pending')
      .query(`
        INSERT INTO Events (
          title, description, category, event_date, event_time,
          venue, fee, expected_attendees, club_id, created_by, status
        )
        OUTPUT INSERTED.*
        VALUES (
          @title, @description, @category, @event_date, @event_time,
          @venue, @fee, @expected_attendees, @club_id, @created_by, @status
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: result.recordset[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// ==================== UPDATE EVENT ====================
// Protected - creator or admin only
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    // Check if event exists and user has permission
    const eventCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT created_by FROM Events WHERE id = @id');

    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only creator or admin can update
    if (eventCheck.recordset[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event'
      });
    }

    const {
      title,
      description,
      category,
      event_date,
      event_time,
      venue,
      fee,
      expected_attendees,
      status
    } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('category', sql.NVarChar, category)
      .input('event_date', sql.Date, event_date)
      .input('event_time', sql.Time, event_time)
      .input('venue', sql.NVarChar, venue)
      .input('fee', sql.NVarChar, fee)
      .input('expected_attendees', sql.Int, expected_attendees)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Events
        SET 
          title = @title,
          description = @description,
          category = @category,
          event_date = @event_date,
          event_time = @event_time,
          venue = @venue,
          fee = @fee,
          expected_attendees = @expected_attendees,
          status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: result.recordset[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

// ==================== DELETE EVENT ====================
// Protected - admin only
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    // Check if event exists
    const eventCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM Events WHERE id = @id');

    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete event
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Events WHERE id = @id');

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

// ==================== REGISTER FOR EVENT ====================
// Protected - authenticated users only
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { registration_type } = req.body; // 'performer' or 'attendee'
    const pool = req.app.get('dbPool');

    // Check if event exists
    const eventCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Events WHERE id = @id');

    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already registered
    const regCheck = await pool.request()
      .input('event_id', sql.Int, id)
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT * FROM EventRegistrations WHERE event_id = @event_id AND user_id = @user_id');

    if (regCheck.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Register for event
    await pool.request()
      .input('event_id', sql.Int, id)
      .input('user_id', sql.Int, req.user.id)
      .input('registration_type', sql.NVarChar, registration_type || 'attendee')
      .input('status', sql.NVarChar, 'registered')
      .query(`
        INSERT INTO EventRegistrations (event_id, user_id, registration_type, status)
        VALUES (@event_id, @user_id, @registration_type, @status)
      `);

    res.json({
      success: true,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event'
    });
  }
});

// ==================== CANCEL REGISTRATION ====================
// Protected - authenticated users only
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    // Check if registered
    const regCheck = await pool.request()
      .input('event_id', sql.Int, id)
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT * FROM EventRegistrations WHERE event_id = @event_id AND user_id = @user_id');

    if (regCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Cancel registration
    await pool.request()
      .input('event_id', sql.Int, id)
      .input('user_id', sql.Int, req.user.id)
      .query('DELETE FROM EventRegistrations WHERE event_id = @event_id AND user_id = @user_id');

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
});

// ==================== GET EVENT REGISTRATIONS ====================
// Protected - event creator or admin only
router.get('/:id/registrations', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    // Check if event exists and user has permission
    const eventCheck = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT created_by FROM Events WHERE id = @id');

    if (eventCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only creator or admin can view registrations
    if (eventCheck.recordset[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view registrations'
      });
    }

    const result = await pool.request()
      .input('event_id', sql.Int, id)
      .query(`
        SELECT 
          er.id,
          er.registration_type,
          er.status,
          er.registration_time,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.student_id
        FROM EventRegistrations er
        JOIN Users u ON er.user_id = u.id
        WHERE er.event_id = @event_id
        ORDER BY er.registration_time DESC
      `);

    res.json({
      success: true,
      count: result.recordset.length,
      registrations: result.recordset
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

export default router;

// ==================== APPROVE EVENT ====================
router.post('/:id/approve', authenticateToken, authorize('admin', 'club_faculty'), async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_status, comments } = req.body;

    if (!approval_status || (approval_status !== 'approved' && approval_status !== 'rejected')) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    const pool = req.app.get('dbPool');

    // Update event status
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, approval_status)
      .query('UPDATE Events SET status = @status WHERE id = @id');

    // Create approval record
    await pool.request()
      .input('event_id', sql.Int, id)
      .input('approved_by', sql.Int, req.user.id)
      .input('approval_status', sql.NVarChar, approval_status)
      .input('comments', sql.NVarChar, comments)
      .query('INSERT INTO EventApprovals (event_id, approved_by, approval_status, comments) VALUES (@event_id, @approved_by, @approval_status, @comments)');

    res.json({ success: true, message: `Event ${approval_status} successfully` });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve event' });
  }
});