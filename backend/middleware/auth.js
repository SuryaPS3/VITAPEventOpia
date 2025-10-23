import jwt from 'jsonwebtoken';
import sql from 'mssql';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session is active in database
    const pool = req.app.get('dbPool');
    const sessionCheck = await pool.request()
      .input('token', sql.NVarChar, token)
      .input('user_id', sql.Int, decoded.id)
      .query(`
        SELECT is_active, expires_at 
        FROM UserSessions 
        WHERE session_token = @token AND user_id = @user_id
      `);

    if (sessionCheck.recordset.length === 0 || !sessionCheck.recordset[0].is_active) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired session' 
      });
    }

    if (new Date(sessionCheck.recordset[0].expires_at) < new Date()) {
      return res.status(401).json({ 
        success: false,
        message: 'Session has expired' 
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Check user role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};