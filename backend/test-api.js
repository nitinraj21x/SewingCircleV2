const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Admin API\n');
    
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'follow.admin'
    });
    
    if (loginResponse.data.accessToken) {
      console.log('✅ Admin login successful!');
      const token = loginResponse.data.accessToken;
      console.log(`   Token: ${token.substring(0, 20)}...`);
      console.log(`   Admin: ${loginResponse.data.admin.username}`);
      
      // Step 2: Get pending users
      console.log('\n2️⃣ Fetching pending users...');
      const pendingResponse = await axios.get(`${BASE_URL}/admin/users/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Pending users API response:');
      console.log(`   Success: ${pendingResponse.data.success}`);
      console.log(`   Count: ${pendingResponse.data.count}`);
      console.log(`   Users: ${pendingResponse.data.users.length}`);
      
      if (pendingResponse.data.users.length > 0) {
        console.log('\n📋 Pending users list:');
        pendingResponse.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Status: ${user.status}`);
          console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`);
        });
      } else {
        console.log('\n⚠️  No pending users found in API response');
      }
      
      // Step 3: Get user stats
      console.log('\n3️⃣ Fetching user statistics...');
      const statsResponse = await axios.get(`${BASE_URL}/admin/users/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ User statistics:');
      console.log(`   Total: ${statsResponse.data.stats.total}`);
      console.log(`   Pending: ${statsResponse.data.stats.pending}`);
      console.log(`   Approved: ${statsResponse.data.stats.approved}`);
      console.log(`   Rejected: ${statsResponse.data.stats.rejected}`);
      console.log(`   Suspended: ${statsResponse.data.stats.suspended}`);
      console.log(`   Online: ${statsResponse.data.stats.online}`);
      
      console.log('\n✅ All API tests passed!');
      console.log('\n💡 Next steps:');
      console.log('   1. Open http://localhost:5174/admin');
      console.log('   2. Login with: admin / follow.admin');
      console.log('   3. Check the User Management section');
      console.log('   4. Click the Refresh button if needed');
      
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPI();
