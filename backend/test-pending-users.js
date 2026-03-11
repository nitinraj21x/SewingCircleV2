const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testPendingUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all users
    const allUsers = await User.find({}).select('-password');
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\nAll users:');
      allUsers.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - Status: ${user.status}`);
      });
    }

    // Check pending users specifically
    const pendingUsers = await User.find({ status: 'pending' }).select('-password');
    console.log(`\n⏳ Pending users: ${pendingUsers.length}`);
    
    if (pendingUsers.length > 0) {
      console.log('\nPending users details:');
      pendingUsers.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Status: ${user.status}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No pending users found!');
      console.log('💡 To test the pending users feature:');
      console.log('   1. Go to http://localhost:5173/register');
      console.log('   2. Fill out the registration form');
      console.log('   3. Submit the form');
      console.log('   4. Run this script again');
    }

    // Check approved users
    const approvedUsers = await User.find({ status: 'approved' }).select('-password');
    console.log(`\n✅ Approved users: ${approvedUsers.length}`);

    // Check rejected users
    const rejectedUsers = await User.find({ status: 'rejected' }).select('-password');
    console.log(`❌ Rejected users: ${rejectedUsers.length}`);

    // Check suspended users
    const suspendedUsers = await User.find({ status: 'suspended' }).select('-password');
    console.log(`🚫 Suspended users: ${suspendedUsers.length}`);

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testPendingUsers();
