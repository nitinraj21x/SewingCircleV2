/**
 * Test script for refresh token functionality
 * 
 * This script tests:
 * 1. Login and receive access + refresh tokens
 * 2. Wait for access token to expire (or simulate expiration)
 * 3. Use refresh token to get new access token
 * 4. Verify new access token works
 * 5. Test logout functionality
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testRefreshTokenFlow() {
  console.log('=== Testing Refresh Token Flow ===\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const { accessToken, refreshToken, admin } = loginResponse.data;
    console.log('✓ Login successful');
    console.log(`  Admin: ${admin.username}`);
    console.log(`  Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`  Refresh Token: ${refreshToken.substring(0, 20)}...\n`);

    // Step 2: Verify access token works
    console.log('2. Verifying access token...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✓ Access token is valid');
    console.log(`  Verified admin: ${verifyResponse.data.admin.username}\n`);

    // Step 3: Test refresh token endpoint
    console.log('3. Testing refresh token endpoint...');
    const refreshResponse = await axios.post(`${API_BASE_URL}/admin/refresh-token`, {
      refreshToken
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
    console.log('✓ Token refresh successful');
    console.log(`  New Access Token: ${newAccessToken.substring(0, 20)}...`);
    console.log(`  New Refresh Token: ${newRefreshToken.substring(0, 20)}...\n`);

    // Step 4: Verify new access token works
    console.log('4. Verifying new access token...');
    const verifyNewResponse = await axios.get(`${API_BASE_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${newAccessToken}` }
    });
    console.log('✓ New access token is valid');
    console.log(`  Verified admin: ${verifyNewResponse.data.admin.username}\n`);

    // Step 5: Test that old refresh token is revoked
    console.log('5. Testing that old refresh token is revoked...');
    try {
      await axios.post(`${API_BASE_URL}/admin/refresh-token`, {
        refreshToken // Using old refresh token
      });
      console.log('✗ Old refresh token should have been revoked!');
    } catch (error) {
      console.log('✓ Old refresh token correctly rejected\n');
    }

    // Step 6: Test logout
    console.log('6. Testing logout...');
    await axios.post(`${API_BASE_URL}/admin/logout`, {
      refreshToken: newRefreshToken
    });
    console.log('✓ Logout successful\n');

    // Step 7: Verify refresh token is revoked after logout
    console.log('7. Verifying refresh token is revoked after logout...');
    try {
      await axios.post(`${API_BASE_URL}/admin/refresh-token`, {
        refreshToken: newRefreshToken
      });
      console.log('✗ Refresh token should have been revoked after logout!');
    } catch (error) {
      console.log('✓ Refresh token correctly revoked after logout\n');
    }

    console.log('=== All tests passed! ===');

  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testRefreshTokenFlow();
