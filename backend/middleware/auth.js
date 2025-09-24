const jwt = require('jsonwebtoken');
const sql = require('mssql');

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'eventopia-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is missing',
        error: 'UNAUTHORIZED' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists in database
    const pool = req.app.get('dbPool'); // Get pool from app
    const request = pool.request();
    
    const sessionResult = await request
      .input('userId', sql.Int, decoded.userId)
      .input('token', sql.NVarChar, token)
      .query(`
        SELECT us.*, u.role, u.email, u.first_name, u.last_name, u.is_active
        FROM UserSessions us
        JOIN Users u ON us.user_id = u.id
        WHERE us.user_id = @userId AND us.session_token = @token 
        AND us.expires_at > GETDATE() AND u.is_active = 1
      `);

    if (sessionResult.recordset.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid or expired session',
        error: 'SESSION_EXPIRED' 
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: sessionResult.recordset[0].email,
      role: sessionResult.recordset[0].role,
      firstName: sessionResult.recordset[0].first_name,
      lastName: sessionResult.recordset[0].last_name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'INVALID_TOKEN' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        error: 'TOKEN_EXPIRED' 
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        message: 'Authentication failed',
        error: 'INTERNAL_ERROR' 
      });
    }
  }
};

// Middleware to check user roles
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated',
        error: 'NOT_AUTHENTICATED' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        error: 'FORBIDDEN',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user belongs to a specific club (for club-specific operations)
const authorizeClubAccess = (clubIdParam = 'clubId') => {
  return async (req, res, next) => {
    try {
      const clubId = req.params[clubIdParam];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admin can access any club
      if (userRole === 'admin') {
        return next();
      }

      const pool = req.app.get('dbPool');
      const request = pool.request();

      // Check if user has access to this club
      if (userRole === 'club_faculty') {
        // Club faculty can access clubs they coordinate
        const result = await request
          .input('clubId', sql.Int, clubId)
          .input('userId', sql.Int, userId)
          .query(`
            SELECT id FROM Clubs 
            WHERE id = @clubId AND faculty_coordinator_id = @userId
          `);

        if (result.recordset.length === 0) {
          return res.status(403).json({ 
            message: 'You do not have access to this club',
            error: 'CLUB_ACCESS_DENIED' 
          });
        }
      } else if (userRole === 'club_admin' || userRole === 'club_member') {
        // Club admin/members can access clubs they belong to
        const result = await request
          .input('clubId', sql.Int, clubId)
          .input('userId', sql.Int, userId)
          .query(`
            SELECT cm.id FROM ClubMembers cm
            WHERE cm.club_id = @clubId AND cm.user_id = @userId AND cm.is_active = 1
          `);

        if (result.recordset.length === 0) {
          return res.status(403).json({ 
            message: 'You are not a member of this club',
            error: 'NOT_CLUB_MEMBER' 
          });
        }
      } else {
        return res.status(403).json({ 
          message: 'Insufficient permissions for club access',
          error: 'CLUB_PERMISSION_DENIED' 
        });
      }

      next();
    } catch (error) {
      console.error('Club authorization error:', error);
      return res.status(500).json({ 
        message: 'Authorization check failed',
        error: 'INTERNAL_ERROR' 
      });
    }
  };
};

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { 
      userId, 
      email, 
      role,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};

// Clean up expired sessions
const cleanExpiredSessions = async (pool) => {
  try {
    const request = pool.request();
    await request.query('DELETE FROM UserSessions WHERE expires_at < GETDATE()');
  } catch (error) {
    console.error('Error cleaning expired sessions:', error);
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeClubAccess,
  generateToken,
  cleanExpiredSessions,
  JWT_SECRET
};