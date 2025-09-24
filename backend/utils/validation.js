const { body, param, query } = require('express-validator');

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .custom((value) => {
      // Check if it's a VIT-AP email (optional - you can modify this)
      if (value && !value.endsWith('@vitap.ac.in') && !value.endsWith('@gmail.com')) {
        throw new Error('Please use a valid institutional or Gmail email');
      }
      return true;
    }),
  
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be less than 20 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
];

// Event creation validation
const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Event title is required and must be less than 300 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Event description must be between 10 and 5000 characters'),
  
  body('eventDate')
    .isISO8601()
    .withMessage('Please provide a valid event date')
    .custom((value) => {
      const eventDate = new Date(value);
      const now = new Date();
      if (eventDate <= now) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  
  body('location')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Event location is required and must be less than 300 characters'),
  
  body('performerQuota')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Performer quota must be between 0 and 1000'),
  
  body('attendeeQuota')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Attendee quota must be between 0 and 10000'),
  
  body('registrationStart')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid registration start date'),
  
  body('registrationEnd')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid registration end date')
    .custom((value, { req }) => {
      if (value && req.body.registrationStart) {
        const startDate = new Date(req.body.registrationStart);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('Registration end date must be after start date');
        }
      }
      return true;
    })
];

// Event registration validation
const validateEventRegistration = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  
  body('registrationType')
    .isIn(['performer', 'attendee'])
    .withMessage('Registration type must be either "performer" or "attendee"'),
  
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional information must be less than 1000 characters')
];

// Club creation validation
const validateClubCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Club name is required and must be less than 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Club description must be between 10 and 5000 characters'),
  
  body('clubEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid club email address')
    .custom((value) => {
      // Check if it's a valid institutional email
      if (value && !value.endsWith('@vitap.ac.in')) {
        throw new Error('Club email must be an institutional email');
      }
      return true;
    })
];

// Circular creation validation
const validateCircularCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Circular title is required and must be less than 300 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Circular content must be between 10 and 10000 characters'),
  
  body('targetAudience')
    .optional()
    .isIn(['all', 'clubs', 'students', 'faculty'])
    .withMessage('Target audience must be one of: all, clubs, students, faculty')
];

// ID parameter validation
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Role update validation (for admin use)
const validateRoleUpdate = [
  body('role')
    .isIn(['visitor', 'admin', 'club_faculty', 'club_admin', 'club_member'])
    .withMessage('Invalid role specified')
];

// Event approval validation
const validateEventApproval = [
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments must be less than 1000 characters')
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateEventCreation,
  validateEventRegistration,
  validateClubCreation,
  validateCircularCreation,
  validateIdParam,
  validatePagination,
  validateRoleUpdate,
  validateEventApproval
};