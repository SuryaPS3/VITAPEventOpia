const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');

// Import validation
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate
} = require('../utils/Validation');

// Routes

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, register);

// POST /api/auth/login - User login
router.post('/login', validateLogin, login);

// POST /api/auth/logout - User logout
router.post('/logout', authenticateToken, logout);

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

module.exports = router;