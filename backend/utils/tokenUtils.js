const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(adminId) {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate refresh token (long-lived) and store in database
 */
async function generateRefreshToken(adminId, ipAddress) {
  // Create a random token
  const token = crypto.randomBytes(40).toString('hex');
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  
  // Save to database
  const refreshToken = new RefreshToken({
    token,
    adminId,
    expiresAt,
    createdByIp: ipAddress
  });
  
  await refreshToken.save();
  
  return token;
}

/**
 * Verify and return refresh token from database
 */
async function getRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({ token }).populate('adminId');
  
  if (!refreshToken || !refreshToken.isActive) {
    return null;
  }
  
  return refreshToken;
}

/**
 * Revoke a refresh token
 */
async function revokeToken(token, ipAddress) {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (!refreshToken || !refreshToken.isActive) {
    return false;
  }
  
  refreshToken.revokedAt = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
  
  return true;
}

/**
 * Revoke all refresh tokens for an admin
 */
async function revokeAllTokensForAdmin(adminId, ipAddress) {
  await RefreshToken.updateMany(
    { adminId, revokedAt: null },
    { 
      revokedAt: Date.now(),
      revokedByIp: ipAddress
    }
  );
}

/**
 * Clean up expired and revoked tokens (maintenance function)
 */
async function cleanupExpiredTokens() {
  const result = await RefreshToken.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { revokedAt: { $ne: null, $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Revoked > 30 days ago
    ]
  });
  
  return result.deletedCount;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getRefreshToken,
  revokeToken,
  revokeAllTokensForAdmin,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS
};
