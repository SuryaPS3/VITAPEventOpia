const bcrypt = require('bcryptjs');
const sql = require('mssql');
const { validationResult } = require('express-validator');
const { generateToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, studentId, phone, role = 'visitor' } = req.body;
    const pool = req.app.get('dbPool');

    // Check if user already exists
    const existingUserResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email');

    if (existingUserResult.recordset.length > 0) {
      return res.status(409).json({
        message: 'User with this email already exists',
        error: 'EMAIL_EXISTS'
      });
    }

    // Only allow certain roles for self-registration
    const allowedSelfRegisterRoles = ['visitor'];
    if (!allowedSelfRegisterRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role for registration',
        error: 'INVALID_ROLE'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password_hash', sql.NVarChar, hashedPassword)
      .input('first_name', sql.NVarChar, firstName)
      .input('last_name', sql.NVarChar, lastName)
      .input('role', sql.NVarChar, role)
      .input('student_id', sql.NVarChar, studentId || null)
      .input('phone', sql.NVarChar, phone || null)
      .query(`
        INSERT INTO Users (email, password_hash, first_name, last_name, role, student_id, phone)
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.first_name, INSERTED.last_name, INSERTED.role
        VALUES (@email, @password_hash, @first_name, @last_name, @role, @student_id, @phone)
      `);

    const newUser = result.recordset[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: 'INTERNAL_ERROR'
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const pool = req.app.get('dbPool');

    // Find user
    const userResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT id, email, password_hash, first_name, last_name, role, is_active 
        FROM Users 
        WHERE email = @email
      `);

    if (userResult.recordset.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const user = userResult.recordset[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Store session in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await pool.request()
      .input('userId', sql.Int, user.id)
      .input('sessionToken', sql.NVarChar, token)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .query(`
        INSERT INTO UserSessions (user_id, session_token, expires_at)
        VALUES (@userId, @sessionToken, @expiresAt)
      `);

    // Get user's club information if applicable
    let clubInfo = null;
    if (user.role === 'club_faculty' || user.role === 'club_admin' || user.role === 'club_member') {
      const clubResult = await pool.request()
        .input('userId', sql.Int, user.id)
        .query(`
          SELECT c.id, c.name, cm.position
          FROM Clubs c
          LEFT JOIN ClubMembers cm ON c.id = cm.club_id AND cm.user_id = @userId AND cm.is_active = 1
          WHERE c.faculty_coordinator_id = @userId OR cm.user_id = @userId
        `);
      
      clubInfo = clubResult.recordset;
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        clubs: clubInfo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'INTERNAL_ERROR'
    });
  }
};

// User logout
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const pool = req.app.get('dbPool');
      
      // Remove session from database
      await pool.request()
        .input('token', sql.NVarChar, token)
        .query('DELETE FROM UserSessions WHERE session_token = @token');
    }

    res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = req.app.get('dbPool');

    // Get user details
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT id, email, first_name, last_name, role, student_id, phone, created_at
        FROM Users 
        WHERE id = @userId
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.recordset[0];

    // Get club information if applicable
    let clubInfo = null;
    if (user.role === 'club_faculty' || user.role === 'club_admin' || user.role === 'club_member') {
      const clubResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT c.id, c.name, c.description, cm.position, cm.joined_date
          FROM Clubs c
          LEFT JOIN ClubMembers cm ON c.id = cm.club_id AND cm.user_id = @userId AND cm.is_active = 1
          WHERE c.faculty_coordinator_id = @userId OR cm.user_id = @userId
        `);
      
      clubInfo = clubResult.recordset;
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        studentId: user.student_id,
        phone: user.phone,
        createdAt: user.created_at,
        clubs: clubInfo
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get profile',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { firstName, lastName, phone } = req.body;
    const pool = req.app.get('dbPool');

    // Update user profile
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('phone', sql.NVarChar, phone || null)
      .query(`
        UPDATE Users 
        SET first_name = @firstName, last_name = @lastName, phone = @phone, updated_at = GETDATE()
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.first_name, INSERTED.last_name, INSERTED.phone
        WHERE id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    const updatedUser = result.recordset[0];

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile
};