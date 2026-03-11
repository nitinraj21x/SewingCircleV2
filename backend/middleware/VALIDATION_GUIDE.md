# API Input Validation Guide

## Overview

This document describes the comprehensive input validation system implemented for the Sewing Circle API. The validation middleware provides:

- **Comprehensive validation** for all API endpoints
- **Request sanitization** to prevent XSS and injection attacks
- **Detailed error messages** to help clients understand validation failures
- **Type checking** and format validation
- **Length constraints** to prevent abuse

## Validation Middleware

### Location
`AC_SewingCircle/v3.0/backend/middleware/validation.js`

### Dependencies
- `express-validator`: Validation and sanitization library
- `validator`: Additional validation utilities

## Available Validators

### Event Validation

#### `validateEventCreation`
Validates event creation requests with comprehensive field validation.

**Validated Fields:**
- `type` (required): Must be "upcoming" or "past"
- `status` (optional): Must be "draft", "published", or "archived"

**For Upcoming Events:**
- `name` (required): 3-200 characters
- `date` (required): Event date
- `time` (optional): Event time
- `venue` (optional): Max 300 characters
- `description` (optional): Max 2000 characters

**For Past Events:**
- `header` (required): 3-200 characters
- `theme` (optional): Max 200 characters
- `teaser` (optional): Max 500 characters
- `fullDescription` (optional): Max 5000 characters
- `location` (optional): Max 300 characters
- `duration` (optional): String
- `participants` (optional): Integer 0-10000
- `facilitator` (optional): Max 200 characters

**Usage:**
```javascript
router.post('/events', auth, upload.array('images', 10), validateEventCreation, handler);
```

#### `validateEventUpdate`
Validates event update requests. All fields are optional but must meet validation rules if provided.

**Usage:**
```javascript
router.put('/events/:id', auth, upload.array('images', 10), validateEventUpdate, handler);
```

#### `validateStatusUpdate`
Validates event status change requests.

**Validated Fields:**
- `id` (param, required): Valid MongoDB ObjectId
- `status` (body, required): Must be "draft", "published", or "archived"

**Usage:**
```javascript
router.patch('/events/:id/status', auth, validateStatusUpdate, handler);
```

#### `validateEventId`
Validates MongoDB ObjectId format for event ID parameters.

**Usage:**
```javascript
router.get('/events/:id', validateEventId, handler);
router.delete('/events/:id', auth, validateEventId, handler);
```

### Admin Validation

#### `validateAdminLogin`
Validates admin login credentials.

**Validated Fields:**
- `username` (required): 3-50 characters, alphanumeric with underscores and hyphens only
- `password` (required): Minimum 8 characters

**Usage:**
```javascript
router.post('/admin/login', validateAdminLogin, handler);
```

#### `validateRefreshToken`
Validates refresh token format.

**Validated Fields:**
- `refreshToken` (required): Must be valid JWT format

**Usage:**
```javascript
router.post('/admin/refresh-token', validateRefreshToken, handler);
router.post('/admin/logout', validateRefreshToken, handler);
```

#### `validateAdminCreation`
Validates admin account creation.

**Validated Fields:**
- `username` (required): 3-50 characters, alphanumeric with underscores and hyphens
- `email` (required): Valid email format
- `password` (required): Min 8 characters, must contain uppercase, lowercase, and number
- `role` (optional): Must be "admin" or "super_admin"

**Usage:**
```javascript
router.post('/admin/create', validateAdminCreation, handler);
```

## Input Sanitization

All string inputs are automatically sanitized to prevent security vulnerabilities:

### Sanitization Features

1. **Whitespace Trimming**: Leading and trailing whitespace removed
2. **HTML Escaping**: HTML special characters escaped to prevent XSS
   - `<` becomes `&lt;`
   - `>` becomes `&gt;`
   - `&` becomes `&amp;`
   - `"` becomes `&quot;`
   - `'` becomes `&#x27;`

### Example
```javascript
// Input
{
  name: "  <script>alert('xss')</script>Test Event  "
}

// After sanitization
{
  name: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;Test Event"
}
```

## Error Response Format

When validation fails, the API returns a standardized error response:

### Structure
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "name",
      "message": "Event name must be between 3 and 200 characters",
      "value": "AB",
      "location": "body"
    }
  ],
  "errorCount": 1
}
```

### Fields

- `success` (boolean): Always `false` for validation errors
- `message` (string): General error message
- `code` (string): Error code for programmatic handling
- `errors` (array): Detailed list of validation errors
  - `field` (string): Name of the field that failed validation
  - `message` (string): Human-readable error description
  - `value` (any): The invalid value that was provided
  - `location` (string): Where the field was found (body, params, query)
- `errorCount` (number): Total number of validation errors

### Multiple Errors

When multiple fields fail validation, all errors are returned together:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "name",
      "message": "Event name must be between 3 and 200 characters",
      "value": "AB",
      "location": "body"
    },
    {
      "field": "description",
      "message": "Description must not exceed 2000 characters",
      "value": "...",
      "location": "body"
    }
  ],
  "errorCount": 2
}
```

## Validation Rules Summary

### String Length Constraints

| Field | Min Length | Max Length |
|-------|-----------|-----------|
| Event name | 3 | 200 |
| Event header | 3 | 200 |
| Venue | - | 300 |
| Location | - | 300 |
| Theme | - | 200 |
| Description | - | 2000 |
| Teaser | - | 500 |
| Full Description | - | 5000 |
| Facilitator | - | 200 |
| Username | 3 | 50 |
| Password | 8 | - |

### Numeric Constraints

| Field | Min | Max |
|-------|-----|-----|
| Participants | 0 | 10000 |

### Enum Values

| Field | Valid Values |
|-------|-------------|
| Event Type | "upcoming", "past" |
| Event Status | "draft", "published", "archived" |
| Admin Role | "admin", "super_admin" |

### Format Validation

| Field | Format |
|-------|--------|
| Event ID | MongoDB ObjectId (24 hex characters) |
| Email | Valid email format (RFC 5322) |
| Refresh Token | Valid JWT format |
| Username | Alphanumeric, underscores, hyphens only |

## Testing

### Test Coverage

The validation middleware has comprehensive test coverage including:

- Valid input acceptance
- Required field validation
- Field length validation
- Format validation
- Enum value validation
- Input sanitization
- Error response format
- Multiple error handling

### Running Tests

```bash
npm test -- middleware/validation.test.js
```

### Test Results
All 36 validation tests pass successfully.

## Integration Examples

### Example 1: Event Creation with Validation

```javascript
const express = require('express');
const { validateEventCreation } = require('./middleware/validation');
const auth = require('./middleware/auth');

router.post('/events', auth, validateEventCreation, async (req, res) => {
  // If we reach here, validation passed
  // req.body contains sanitized data
  const event = new Event(req.body);
  await event.save();
  res.status(201).json(event);
});
```

### Example 2: Handling Validation Errors in Client

```javascript
// Client-side error handling
try {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  
  const data = await response.json();
  
  if (!response.ok && data.code === 'VALIDATION_ERROR') {
    // Display validation errors to user
    data.errors.forEach(error => {
      console.error(`${error.field}: ${error.message}`);
      // Update UI to show error next to field
    });
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Security Considerations

### XSS Prevention
All string inputs are HTML-escaped to prevent cross-site scripting attacks.

### Injection Prevention
- MongoDB ObjectId validation prevents NoSQL injection
- Input length limits prevent buffer overflow attacks
- Type validation ensures data integrity

### Rate Limiting
Consider adding rate limiting middleware to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Best Practices

1. **Always validate on the server**: Never trust client-side validation alone
2. **Sanitize all inputs**: Use the provided sanitization functions
3. **Return detailed errors**: Help clients understand what went wrong
4. **Log validation failures**: Monitor for potential attacks
5. **Keep validation rules updated**: Review and update as requirements change
6. **Test thoroughly**: Ensure all edge cases are covered

## Maintenance

### Adding New Validators

To add a new validator:

1. Create validation rules using express-validator
2. Add sanitization using `customSanitizer(sanitizeString)`
3. Include `handleValidationErrors` at the end
4. Write comprehensive tests
5. Update this documentation

### Example: Adding Image Validation

```javascript
const validateImageUpload = [
  body('image')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Image file is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Invalid image format. Only JPEG, PNG, and GIF allowed');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        throw new Error('Image size must not exceed 5MB');
      }
      
      return true;
    }),
  
  handleValidationErrors
];
```

## Related Documentation

- [Express Validator Documentation](https://express-validator.github.io/docs/)
- [Validator.js Documentation](https://github.com/validatorjs/validator.js)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Support

For questions or issues with validation:
1. Check this documentation
2. Review test cases in `validation.test.js`
3. Consult the design document requirements 2.5 and 2.6
