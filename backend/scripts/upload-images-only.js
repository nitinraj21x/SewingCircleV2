require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

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
    console.log(`✓ Uploaded: ${path.basename(filePath)}`);
    console.log(`  URL: ${result.secure_url}\n`);
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

async function uploadImages() {
  console.log('\n🚀 Uploading images to Cloudinary...\n');

  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Get all image files
  const imageFiles = getImageFiles(uploadsDir);
  console.log(`Found ${imageFiles.length} images to upload\n`);

  let successCount = 0;
  let failCount = 0;

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
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n✅ Upload complete!');
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Failed: ${failCount}`);
  console.log('\n💡 Images are now in your Cloudinary account');
  console.log('   Visit: https://cloudinary.com/console/media_library\n');
}

// Run upload
uploadImages().catch(error => {
  console.error('Upload failed:', error);
  process.exit(1);
});
