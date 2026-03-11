const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found in database');
      console.log('Run: node seed.js to create admin user');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('   Username:', admin.username);
    console.log('   Email:', admin.email);
    console.log('   Is Active:', admin.isActive);
    console.log('   Is Locked:', admin.isLocked);
    console.log('   Created:', admin.createdAt);

    // Test password comparison
    const testPassword = 'follow.admin';
    const isMatch = await admin.comparePassword(testPassword);
    
    if (isMatch) {
      console.log('✅ Password verification successful!');
      console.log('   Admin can login with:');
      console.log('   Username: admin');
      console.log('   Password: follow.admin');
    } else {
      console.log('❌ Password verification failed!');
      console.log('   The password does not match');
      console.log('   Try resetting the admin password');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testAdminLogin();
