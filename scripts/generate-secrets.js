#!/usr/bin/env node

/**
 * Generate Secure Secrets for Deployment
 * 
 * This script generates cryptographically secure random strings
 * for use as JWT secrets and other sensitive configuration values.
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Deployment\n');
console.log('=' .repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET:');
console.log(jwtSecret);

// Generate JWT Refresh Secret
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);

// Generate Session Secret (if needed)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 SESSION_SECRET (optional):');
console.log(sessionSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Secrets generated successfully!');
console.log('\n⚠️  IMPORTANT: Keep these secrets secure and never commit them to Git!');
console.log('   Add them to your .env file or hosting platform environment variables.\n');

// Create example .env content
console.log('📋 Example .env file:\n');
console.log(`# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sewingcircle

# JWT Secrets
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
`);
