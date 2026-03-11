require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixImageUrls() {
  console.log('\n🔧 Fixing image URLs in database...\n');

  try {
    // Fix Events
    const events = await Event.find({});
    let eventsFixed = 0;

    for (const event of events) {
      let updated = false;

      // Check if coverImage has old path
      if (event.coverImage && event.coverImage.startsWith('/uploads/')) {
        console.log(`⚠️  Event "${event.name}" has old coverImage path: ${event.coverImage}`);
        console.log('   This needs to be updated manually or re-uploaded');
        // Set to null so it doesn't break the frontend
        event.coverImage = null;
        updated = true;
      }

      // Check gallery images
      if (event.gallery && Array.isArray(event.gallery)) {
        const oldGallery = [...event.gallery];
        event.gallery = event.gallery.filter(img => {
          if (img.startsWith('/uploads/')) {
            console.log(`⚠️  Event "${event.name}" has old gallery image: ${img}`);
            return false; // Remove old paths
          }
          return true; // Keep Cloudinary URLs
        });

        if (oldGallery.length !== event.gallery.length) {
          updated = true;
        }
      }

      if (updated) {
        await event.save();
        eventsFixed++;
        console.log(`✓ Fixed event: ${event.name}`);
      }
    }

    // Fix Users
    const users = await User.find({});
    let usersFixed = 0;

    for (const user of users) {
      let updated = false;

      // Check profile picture
      if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
        console.log(`⚠️  User "${user.firstName} ${user.lastName}" has old profilePicture: ${user.profilePicture}`);
        user.profilePicture = '/uploads/profiles/default-avatar.png'; // Set to default
        updated = true;
      }

      // Check cover photo
      if (user.coverPhoto && user.coverPhoto.startsWith('/uploads/')) {
        console.log(`⚠️  User "${user.firstName} ${user.lastName}" has old coverPhoto: ${user.coverPhoto}`);
        user.coverPhoto = '/uploads/profiles/default-cover.jpg'; // Set to default
        updated = true;
      }

      if (updated) {
        await user.save();
        usersFixed++;
        console.log(`✓ Fixed user: ${user.firstName} ${user.lastName}`);
      }
    }

    console.log('\n✅ Fix complete!');
    console.log(`   - Events fixed: ${eventsFixed}`);
    console.log(`   - Users fixed: ${usersFixed}`);
    console.log('\n💡 Old image paths have been removed. Please re-upload images through the admin dashboard.\n');

  } catch (error) {
    console.error('Error fixing URLs:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixImageUrls();
