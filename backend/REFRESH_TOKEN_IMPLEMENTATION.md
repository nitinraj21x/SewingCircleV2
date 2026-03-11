# Refresh Token Implementation

This document describes the refresh token implementation for the Sewing Circle admin authentication system.

## Overview

The authentication system now uses a dual-token approach:
- **Access Token**: Short-lived JWT (15 minutes) for API authentication
- **Refresh Token**: Long-lived random token (7 days) stored in database for session management

## Architecture

### Backend Components

#### 1. RefreshToken Model (`models/RefreshToken.js`)
Stores refresh tokens in MongoDB with:
- `token`: Unique random token (40 bytes hex)
- `adminId`: Reference to Admin user
- `expiresAt`: Expiration timestamp
- `createdByIp`: IP address of token creation
- `revokedAt`: Timestamp when token was revoked
- `revokedByIp`: IP address of revocation
- `replacedByToken`: New token that replaced this one

Features:
- Automatic cleanup of expired tokens via TTL index
- Virtual properties for `isExpired` and `isActive` checks

#### 2. Token Utilities (`utils/tokenUtils.js`)
Centralized token management functions:
- `generateAccessToken(adminId)`: Creates short-lived JWT
- `generateRefreshToken(adminId, ipAddress)`: Creates and stores refresh token
- `getRefreshToken(token)`: Retrieves and validates refresh token
- `revokeToken(token, ipAddress)`: Revokes a single refresh token
- `revokeAllTokensForAdmin(adminId, ipAddress)`: Revokes all tokens for an admin
- `cleanupExpiredTokens()`: Maintenance function for cleanup

#### 3. Enhanced Auth Middleware (`middleware/auth.js`)
Improved error handling with specific error codes:
- `NO_TOKEN`: No authorization header provided
- `TOKEN_EXPIRED`: JWT has expired (triggers refresh on frontend)
- `INVALID_TOKEN`: JWT is malformed or invalid
- `TOKEN_ERROR`: Generic token verification error

#### 4. Admin Routes (`routes/admin.js`)
New endpoints:

**POST /api/admin/login**
- Returns both `accessToken` and `refreshToken`
- Checks account lock status and active status
- Updates last login timestamp
- Resets failed login attempts

**POST /api/admin/refresh-token**
- Accepts `refreshToken` in request body
- Validates refresh token from database
- Generates new access and refresh tokens
- Revokes old refresh token (token rotation)
- Links old token to new token via `replacedByToken`

**POST /api/admin/logout**
- Accepts `refreshToken` in request body
- Revokes the refresh token
- Clears session

**POST /api/admin/logout-all**
- Requires valid access token
- Revokes all refresh tokens for the admin
- Useful for security incidents

**GET /api/admin/verify**
- Verifies access token validity
- Returns admin information
- Used for session validation

### Frontend Components

#### Enhanced API Client (`frontend/src/services/api.js`)

**Token Storage**
- Access token stored in `localStorage` as `accessToken`
- Refresh token stored in `localStorage` as `refreshToken`

**Request Interceptor**
- Automatically adds access token to Authorization header

**Response Interceptor**
- Detects `TOKEN_EXPIRED` error (401 with code)
- Automatically refreshes token using refresh token
- Queues failed requests during refresh
- Retries failed requests with new access token
- Redirects to login if refresh fails

**Enhanced adminAPI Methods**
- `login()`: Stores both tokens, returns admin info
- `logout()`: Revokes refresh token, clears storage
- `logoutAll()`: Revokes all tokens, clears storage
- `verifyToken()`: Validates current session
- `refreshToken()`: Manually refresh tokens (rarely needed)

## Token Lifecycle

### 1. Login Flow
```
User → Login Request → Backend
Backend → Validate Credentials
Backend → Generate Access Token (15min)
Backend → Generate Refresh Token (7 days)
Backend → Store Refresh Token in DB
Backend → Return Both Tokens
Frontend → Store Tokens in localStorage
```

### 2. API Request Flow
```
Frontend → Add Access Token to Request
Backend → Validate Access Token
Backend → Process Request
Backend → Return Response
```

### 3. Token Expiration Flow
```
Frontend → API Request with Expired Access Token
Backend → Return 401 with TOKEN_EXPIRED code
Frontend → Intercept Error
Frontend → Send Refresh Token to /refresh-token
Backend → Validate Refresh Token from DB
Backend → Generate New Access Token
Backend → Generate New Refresh Token
Backend → Revoke Old Refresh Token
Backend → Return New Tokens
Frontend → Store New Tokens
Frontend → Retry Original Request
```

### 4. Logout Flow
```
Frontend → Send Refresh Token to /logout
Backend → Revoke Refresh Token in DB
Backend → Return Success
Frontend → Clear Tokens from localStorage
```

## Security Features

### Token Rotation
- Each refresh generates a new refresh token
- Old refresh token is immediately revoked
- Prevents token reuse attacks

### IP Tracking
- Records IP address on token creation
- Records IP address on token revocation
- Useful for security auditing

### Account Locking
- Login checks for locked accounts
- Prevents authentication even with valid credentials

### Automatic Cleanup
- MongoDB TTL index removes expired tokens
- Maintenance function removes old revoked tokens

### Token Validation
- Refresh tokens validated against database
- Checks for expiration and revocation
- Verifies admin account is still active

## Configuration

### Token Expiration Times
Configured in `utils/tokenUtils.js`:
```javascript
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days
```

### JWT Secret
Set in `.env`:
```
JWT_SECRET=your-secret-key-here
```

## Testing

### Manual Testing
Run the test script:
```bash
cd AC_SewingCircle/v3.0/backend
node test-refresh-token.js
```

This tests:
1. Login and token generation
2. Access token validation
3. Token refresh
4. New token validation
5. Old token revocation
6. Logout
7. Post-logout token revocation

### Integration Testing
The frontend automatically handles token refresh:
1. Make API requests normally
2. When access token expires, refresh happens automatically
3. Original request is retried with new token
4. User experience is seamless

## Migration from Old System

### Backend Changes
1. Old system used single token with 24h expiry
2. New system uses dual tokens (15min + 7 days)
3. Token storage changed from `token` to `accessToken` and `refreshToken`

### Frontend Changes
1. Update `localStorage` key from `adminToken` to `accessToken`
2. Store additional `refreshToken`
3. Update login handler to extract both tokens
4. Add logout handler to revoke refresh token

### Backward Compatibility
The system is NOT backward compatible. All existing sessions will be invalidated and users must log in again.

## Troubleshooting

### "Token has expired" errors
- Normal behavior when access token expires
- Should automatically refresh
- If refresh fails, user is redirected to login

### "Invalid or expired refresh token"
- Refresh token has expired (7 days)
- Refresh token was revoked
- User must log in again

### Infinite refresh loops
- Check that new tokens are being stored correctly
- Verify `_retry` flag is set on requests
- Check for race conditions in refresh logic

### Tokens not persisting
- Verify localStorage is available
- Check browser privacy settings
- Ensure tokens are being stored after login

## Future Enhancements

1. **Remember Me**: Extend refresh token expiry for "remember me" option
2. **Device Management**: Track and manage active sessions per device
3. **Push Notifications**: Notify users of new logins
4. **Suspicious Activity**: Detect and alert on unusual login patterns
5. **Token Blacklisting**: Add Redis for real-time token blacklisting
6. **Sliding Sessions**: Extend refresh token expiry on activity
