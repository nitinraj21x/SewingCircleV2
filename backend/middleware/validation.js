const { body, param, validationResult } = require('express-validator');
const validator = require('validator');

/**
 * Middleware to handle validation errors
 * Returns detailed error messages for each field
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
      errorCount: formattedErrors.length
    });
  }
  
  next();
};

/**
 * Sanitize string input - trim whitespace and escape HTML
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return validator.escape(validator.trim(value));
};

/**
 * Validation rules for event creation
 */
const validateEventCreation = [
  body('type')
    .trim()
    .notEmpty().withMessage('Event type is required')
    .isIn(['upcoming', 'past']).withMessage('Event type must be either "upcoming" or "past"')
    .customSanitizer(sanitizeString),
  
  body('status')
    .optional()
    .trim()
    .isIn(['draft', 'published', 'archived']).withMessage('Status must be one of: draft, published, archived')
    .customSanitizer(sanitizeString),
  
  // Upcoming event fields
  body('name')
    .if(body('type').equals('upcoming'))
    .trim()
    .notEmpty().withMessage('Event name is required for upcoming events')
    .isLength({ min: 3, max: 200 }).withMessage('Event name must be between 3 and 200 characters')
    .customSanitizer(sanitizeString),
  
  body('date')
    .if(body('type').equals('upcoming'))
    .trim()
    .notEmpty().withMessage('Event date is required for upcoming events')
    .customSanitizer(sanitizeString),
  
  body('time')
    .if(body('type').equals('upcoming'))
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('venue')
    .if(body('type').equals('upcoming'))
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Venue must not exceed 300 characters')
    .customSanitizer(sanitizeString),
  
  body('description')
    .if(body('type').equals('upcoming'))
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters')
    .customSanitizer(sanitizeString),
  
  // Past event fields
  body('header')
    .if(body('type').equals('past'))
    .trim()
    .notEmpty().withMessage('Header is required for past events')
    .isLength({ min: 3, max: 200 }).withMessage('Header must be between 3 and 200 characters')
    .customSanitizer(sanitizeString),
  
  body('theme')
    .if(body('type').equals('past'))
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Theme must not exceed 200 characters')
    .customSanitizer(sanitizeString),
  
  body('teaser')
    .if(body('type').equals('past'))
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Teaser must not exceed 500 characters')
    .customSanitizer(sanitizeString),
  
  body('fullDescription')
    .if(body('type').equals('past'))
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Full description must not exceed 5000 characters')
    .customSanitizer(sanitizeString),
  
  body('location')
    .if(body('type').equals('past'))
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location must not exceed 300 characters')
    .customSanitizer(sanitizeString),
  
  body('duration')
    .if(body('type').equals('past'))
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('participants')
    .if(body('type').equals('past'))
    .optional()
    .isInt({ min: 0, max: 10000 }).withMessage('Participants must be a number between 0 and 10000'),
  
  body('facilitator')
    .if(body('type').equals('past'))
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Facilitator name must not exceed 200 characters')
    .customSanitizer(sanitizeString),
  
  body('coverImage')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('gallery')
    .optional()
    .isArray().withMessage('Gallery must be an array'),
  
  body('gallery.*')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  handleValidationErrors
];

/**
 * Validation rules for event update
 */
const validateEventUpdate = [
  param('id')
    .trim()
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid event ID format'),
  
  body('type')
    .optional()
    .trim()
    .isIn(['upcoming', 'past']).withMessage('Event type must be either "upcoming" or "past"')
    .customSanitizer(sanitizeString),
  
  body('status')
    .optional()
    .trim()
    .isIn(['draft', 'published', 'archived']).withMessage('Status must be one of: draft, published, archived')
    .customSanitizer(sanitizeString),
  
  // Upcoming event fields
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Event name must be between 3 and 200 characters')
    .customSanitizer(sanitizeString),
  
  body('date')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('time')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('venue')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Venue must not exceed 300 characters')
    .customSanitizer(sanitizeString),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters')
    .customSanitizer(sanitizeString),
  
  // Past event fields
  body('header')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Header must be between 3 and 200 characters')
    .customSanitizer(sanitizeString),
  
  body('theme')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Theme must not exceed 200 characters')
    .customSanitizer(sanitizeString),
  
  body('teaser')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Teaser must not exceed 500 characters')
    .customSanitizer(sanitizeString),
  
  body('fullDescription')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Full description must not exceed 5000 characters')
    .customSanitizer(sanitizeString),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location must not exceed 300 characters')
    .customSanitizer(sanitizeString),
  
  body('duration')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('participants')
    .optional()
    .isInt({ min: 0, max: 10000 }).withMessage('Participants must be a number between 0 and 10000'),
  
  body('facilitator')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Facilitator name must not exceed 200 characters')
    .customSanitizer(sanitizeString),
  
  body('coverImage')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  body('gallery')
    .optional()
    .isArray().withMessage('Gallery must be an array'),
  
  body('gallery.*')
    .optional()
    .trim()
    .customSanitizer(sanitizeString),
  
  handleValidationErrors
];

/**
 * Validation rules for event status update
 */
const validateStatusUpdate = [
  param('id')
    .trim()
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid event ID format'),
  
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['draft', 'published', 'archived']).withMessage('Status must be one of: draft, published, archived')
    .customSanitizer(sanitizeString),
  
  handleValidationErrors
];

/**
 * Validation rules for event ID parameter
 */
const validateEventId = [
  param('id')
    .trim()
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid event ID format'),
  
  handleValidationErrors
];

/**
 * Validation rules for admin login
 */
const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .customSanitizer(sanitizeString),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  
  handleValidationErrors
];

/**
 * Validation rules for refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty().withMessage('Refresh token is required')
    .isJWT().withMessage('Invalid refresh token format'),
  
  handleValidationErrors
];

/**
 * Validation rules for admin creation
 */
const validateAdminCreation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .customSanitizer(sanitizeString),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .trim()
    .isIn(['admin', 'super_admin']).withMessage('Role must be either "admin" or "super_admin"')
    .customSanitizer(sanitizeString),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateEventCreation,
  validateEventUpdate,
  validateStatusUpdate,
  validateEventId,
  validateAdminLogin,
  validateRefreshToken,
  validateAdminCreation
};
