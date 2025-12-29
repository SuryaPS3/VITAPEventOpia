import express from 'express';
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
    
    const result = await pool.query(`
      SELECT * FROM Events LIMIT 5
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      events: result.rows
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
        e.registration_form_url,
        e.status,
        e.created_at,
        c.name as club_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM Events e
      LEFT JOIN Clubs c ON e.club_id = c.id
      LEFT JOIN Users u ON e.created_by = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Filter by status
    if (status) {
      query += ` AND e.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    // Filter by category
    if (category) {
      query += ` AND e.category = $${paramIndex++}`;
      queryParams.push(category);
    }

    // Search by title or description
    if (search) {
      query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY e.event_date DESC';

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      events: result.rows
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// ==================== GET PENDING EVENTS FOR APPROVAL ====================
// Protected - department_head only
router.get('/pending', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const pool = req.app.get('dbPool');

    const result = await pool.query(`
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
        e.registration_start,
        e.registration_end,
        e.status,
        e.created_at,
        c.name as club_name,
        c.club_email,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        creator.email as created_by_email
      FROM Events e
      LEFT JOIN Clubs c ON e.club_id = c.id
      LEFT JOIN Users creator ON e.created_by = creator.id
      WHERE e.status = 'pending'
      ORDER BY e.created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      events: result.rows
    });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending events'
    });
  }
});

// ==================== GET SINGLE EVENT ====================
// Public endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    const result = await pool.query(
      `
        SELECT 
          e.*,
          c.name as club_name,
          c.club_email,
          u.first_name || ' ' || u.last_name as created_by_name,
          u.email as created_by_email,
          (SELECT COUNT(*) FROM EventRegistrations WHERE event_id = e.id AND status = 'registered') as registered_count
        FROM Events e
        LEFT JOIN Clubs c ON e.club_id = c.id
        LEFT JOIN Users u ON e.created_by = u.id
        WHERE e.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: result.rows[0]
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
      club_id,
      registration_form_url
    } = req.body;

    // Validation
    if (!title || !event_date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, event_date, and venue'
      });
    }

    const pool = req.app.get('dbPool');

    const result = await pool.query(
      `
        INSERT INTO Events (
          title, description, category, event_date, event_time,
          venue, fee, expected_attendees, club_id, created_by, status, registration_form_url
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING *
      `,
      [
        title,
        description || null,
        category || 'General',
        event_date,
        event_time || null,
        venue,
        fee || 'Free',
        expected_attendees || 50,
        club_id || 1,
        req.user.id,
        'pending',
        registration_form_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create event error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const eventCheck = await pool.query(
      'SELECT created_by FROM Events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only creator or admin can update
    if (eventCheck.rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
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

    const result = await pool.query(
      `
        UPDATE Events
        SET 
          title = $1,
          description = $2,
          category = $3,
          event_date = $4,
          event_time = $5,
          venue = $6,
          fee = $7,
          expected_attendees = $8,
          status = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `,
      [
        title,
        description,
        category,
        event_date,
        event_time,
        venue,
        fee,
        expected_attendees,
        status,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: result.rows[0]
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
    const eventCheck = await pool.query(
      'SELECT id FROM Events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete event
    await pool.query(
      'DELETE FROM Events WHERE id = $1',
      [id]
    );

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
    const eventCheck = await pool.query(
      'SELECT * FROM Events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if already registered
    const regCheck = await pool.query(
      'SELECT * FROM EventRegistrations WHERE event_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (regCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Register for event
    await pool.query(
      `
        INSERT INTO EventRegistrations (event_id, user_id, registration_type, status)
        VALUES ($1, $2, $3, $4)
      `,
      [id, req.user.id, registration_type || 'attendee', 'registered']
    );

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
    const regCheck = await pool.query(
      'SELECT * FROM EventRegistrations WHERE event_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (regCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Cancel registration
    await pool.query(
      'DELETE FROM EventRegistrations WHERE event_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

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
    const eventCheck = await pool.query(
      'SELECT created_by FROM Events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only creator or admin can view registrations
    if (eventCheck.rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view registrations'
      });
    }

    const result = await pool.query(
      `
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
        WHERE er.event_id = $1
        ORDER BY er.registration_time DESC
      `,
      [id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      registrations: result.rows
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

// ==================== APPROVE EVENT ====================
// Protected - department_head only
router.put('/:id/approve', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const pool = req.app.get('dbPool');

    // Check if event exists and is pending
    const eventCheck = await pool.query(
      'SELECT id, status, title FROM Events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = eventCheck.rows[0];
    if (event.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve event with status: ${event.status}`
      });
    }

    // Approve the event
    const result = await pool.query(
      `
        UPDATE Events
        SET 
          status = 'approved',
          approved_by = $1,
          approval_date = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
      [req.user.id, new Date(), id]
    );

    // Log the approval in EventApprovals table if it exists
    try {
      await pool.query(
        `
          INSERT INTO EventApprovals (event_id, approved_by, approval_status, comments, approval_date)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        `,
        [id, req.user.id, 'approved', comments || 'Event approved by department head']
      );
    } catch (approvalLogError) {
      console.log('Note: Could not log to EventApprovals table:', approvalLogError.message);
    }

    res.json({
      success: true,
      message: `Event "${event.title}" has been approved successfully`,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve event'
    });
  }
});

// ==================== REJECT EVENT ====================
// Protected - department_head only
router.put('/:id/reject', authenticateToken, authorize('department_head'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const pool = req.app.get('dbPool');

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Check if event exists and is pending
    const eventCheck = await pool.query(
      'SELECT id, status, title FROM Events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = eventCheck.rows[0];
    if (event.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject event with status: ${event.status}`
      });
    }

    // Reject the event
    const result = await pool.query(
      `
        UPDATE Events
        SET 
          status = 'rejected',
          approved_by = $1,
          approval_date = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
      [req.user.id, new Date(), id]
    );

    // Log the rejection in EventApprovals table if it exists
    try {
      await pool.query(
        `
          INSERT INTO EventApprovals (event_id, approved_by, approval_status, comments, approval_date)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        `,
        [id, req.user.id, 'rejected', reason]
      );
    } catch (approvalLogError) {
      console.log('Note: Could not log to EventApprovals table:', approvalLogError.message);
    }

    res.json({
      success: true,
      message: `Event "${event.title}" has been rejected`,
      reason: reason,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject event'
    });
  }
});

// ==================== GET APPROVAL HISTORY ====================
// Protected - department_head and admin only
router.get('/:id/approvals', authenticateToken, authorize('department_head', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    // Get event basic info
    const eventResult = await pool.query(
      `
        SELECT 
          e.id,
          e.title,
          e.status,
          e.approved_by,
          e.approval_date,
          approver.first_name || ' ' || approver.last_name as approved_by_name
        FROM Events e
        LEFT JOIN Users approver ON e.approved_by = approver.id
        WHERE e.id = $1
      `,
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get approval history from EventApprovals table if it exists
    let approvalHistory = [];
    try {
      const historyResult = await pool.query(
        `
          SELECT 
            ea.approval_status,
            ea.comments,
            ea.approval_date,
            u.first_name || ' ' || u.last_name as approver_name,
            u.email as approver_email
          FROM EventApprovals ea
          LEFT JOIN Users u ON ea.approved_by = u.id
          WHERE ea.event_id = $1
          ORDER BY ea.approval_date DESC
        `,
        [id]
      );
      approvalHistory = historyResult.rows;
    } catch (historyError) {
      console.log('Note: EventApprovals table not accessible:', historyError.message);
    }

    res.json({
      success: true,
      event: eventResult.rows[0],
      approvalHistory: approvalHistory
    });
  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approval history'
    });
  }
});

export default router;
