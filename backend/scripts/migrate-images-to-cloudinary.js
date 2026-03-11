require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Helper function to upload a file to Cloudinary
async function uploadFile(filePath, folder) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    console.log(`✓ Uploaded: ${path.basename(filePath)} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`✗ Failed to upload ${filePath}:`, error.message);
    return null;
  }
}

// Get all image files from a directory
function getImageFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath));
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function migrateImages() {
  console.log('\n🚀 Starting image migration to Cloudinary...\n');

  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Get all image files
  const imageFiles = getImageFiles(uploadsDir);
  console.log(`Found ${imageFiles.length} images to migrate\n`);

  // Upload all images
  const uploadMap = {}; // Map old path to new Cloudinary URL
  
  for (const filePath of imageFiles) {
    const relativePath = filePath.replace(uploadsDir, '').replace(/\\/g, '/');
    
    // Determine folder based on path
    let folder = 'sewing-circle/events';
    if (relativePath.includes('/profiles/')) {
      folder = 'sewing-circle/profiles';
    } else if (relativePath.includes('/posts/')) {
      folder = 'sewing-circle/posts';
    } else if (relativePath.includes('/backgrounds/')) {
      folder = 'sewing-circle/backgrounds';
    }
    
    const cloudinaryUrl = await uploadFile(filePath, folder);
    if (cloudinaryUrl) {
      uploadMap[relativePath] = cloudinaryUrl;
    }
  }

  console.log(`\n✓ Uploaded ${Object.keys(uploadMap).length} images to Cloudinary\n`);

  // Update database records
  console.log('📝 Updating database records...\n');

  // Update Events
  const events = await Event.find({});
  let eventsUpdated = 0;

  for (const event of events) {
    let updated = false;

    // Update cover image
    if (event.coverImage && uploadMap[event.coverImage]) {
      event.coverImage = uploadMap[event.coverImage];
      updated = true;
    }

    // Update gallery images
    if (event.gallery && Array.isArray(event.gallery)) {
      event.gallery = event.gallery.map(img => uploadMap[img] || img);
      updated = true;
    }

    if (updated) {
      await event.save();
      eventsUpdated++;
      console.log(`✓ Updated event: ${event.name}`);
    }
  }

  // Update Users
  const users = await User.find({});
  let usersUpdated = 0;

  for (const user of users) {
    let updated = false;

    // Update profile picture
    if (user.profilePicture && uploadMap[user.profilePicture]) {
      user.profilePicture = uploadMap[user.profilePicture];
      updated = true;
    }

    // Update cover photo
    if (user.coverPhoto && uploadMap[user.coverPhoto]) {
      user.coverPhoto = uploadMap[user.coverPhoto];
      updated = true;
    }

    if (updated) {
      await user.save();
      usersUpdated++;
      console.log(`✓ Updated user: ${user.firstName} ${user.lastName}`);
    }
  }

  console.log('\n✅ Migration complete!');
  console.log(`   - Images uploaded: ${Object.keys(uploadMap).length}`);
  console.log(`   - Events updated: ${eventsUpdated}`);
  console.log(`   - Users updated: ${usersUpdated}`);
  console.log('\n💡 You can now safely delete the uploads/ folder\n');

  mongoose.connection.close();
}

// Run migration
migrateImages().catch(error => {
  console.error('Migration failed:', error);
  mongoose.connection.close();
  process.exit(1);
});
