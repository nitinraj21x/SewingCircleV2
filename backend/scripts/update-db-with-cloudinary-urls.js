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

// Mapping of old paths to Cloudinary URLs (from our upload)
const imageMapping = {
  '/uploads/feb1.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260524/sewing-circle/events/bgqqeomk3grvtaovzvlf.jpg',
  '/uploads/feb2.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260525/sewing-circle/events/erzbhtcdof01xckacips.jpg',
  '/uploads/april1.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260506/sewing-circle/events/couu3uvlgktp9gtt2eez.jpg',
  '/uploads/april2.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260508/sewing-circle/events/yx6mmvoddfsqrdfgazsj.jpg',
  '/uploads/april3.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260509/sewing-circle/events/lhimftwlk49c36w15alb.jpg',
  '/uploads/june1.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260529/sewing-circle/events/zdnldqkxjuaxayh28ele.jpg',
  '/uploads/june2.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260530/sewing-circle/events/vtgp7s0rmjttz7l9qgi3.jpg',
  '/uploads/oct1.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260535/sewing-circle/events/c097ha1aikpua5ffjnbc.jpg',
  '/uploads/oct2.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260536/sewing-circle/events/b11hkyfh1ua7msngrxzf.jpg',
  '/uploads/oct3.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260537/sewing-circle/events/pfozia1xp41bgt4auu67.jpg',
  '/uploads/dec1.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260519/sewing-circle/events/bxckdwqvtrmjflopzerz.jpg',
  '/uploads/dec2.jpeg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260520/sewing-circle/events/jinkwcibgdxfdqc4hb60.jpg',
  '/uploads/abtUsImg.jpg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260505/sewing-circle/events/kpfbr9ov4objsvklzwko.jpg',
  '/uploads/visionBg.png': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260516/sewing-circle/backgrounds/gtxnu61eptnjf1i8mlxl.png',
  '/uploads/default-avatar.png': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260505/sewing-circle/events/kpfbr9ov4objsvklzwko.jpg', // placeholder
  '/uploads/default-cover.jpg': 'https://res.cloudinary.com/dnwpnituv/image/upload/v1773260516/sewing-circle/backgrounds/gtxnu61eptnjf1i8mlxl.png' // placeholder
};

async function updateDatabase() {
  console.log('\n🔄 Updating database with Cloudinary URLs...\n');

  try {
    // Update Events
    const events = await Event.find({});
    let eventsUpdated = 0;

    for (const event of events) {
      let updated = false;

      // Update cover image
      if (event.coverImage && imageMapping[event.coverImage]) {
        console.log(`Updating coverImage for event: ${event.name || 'Unnamed'}`);
        console.log(`  Old: ${event.coverImage}`);
        console.log(`  New: ${imageMapping[event.coverImage]}`);
        event.coverImage = imageMapping[event.coverImage];
        updated = true;
      }

      // Update gallery
      if (event.gallery && Array.isArray(event.gallery)) {
        const newGallery = event.gallery.map(img => {
          if (imageMapping[img]) {
            console.log(`  Gallery: ${img} -> ${imageMapping[img]}`);
            return imageMapping[img];
          }
          return img;
        });

        if (JSON.stringify(newGallery) !== JSON.stringify(event.gallery)) {
          event.gallery = newGallery;
          updated = true;
        }
      }

      if (updated) {
        await event.save();
        eventsUpdated++;
        console.log(`✓ Updated event: ${event.name || 'Unnamed'}\n`);
      }
    }

    // Update Users
    const users = await User.find({});
    let usersUpdated = 0;

    for (const user of users) {
      let updated = false;

      // Update profile picture
      if (user.profilePicture && imageMapping[user.profilePicture]) {
        console.log(`Updating profilePicture for: ${user.firstName} ${user.lastName}`);
        user.profilePicture = imageMapping[user.profilePicture];
        updated = true;
      }

      // Update cover photo
      if (user.coverPhoto && imageMapping[user.coverPhoto]) {
        console.log(`Updating coverPhoto for: ${user.firstName} ${user.lastName}`);
        user.coverPhoto = imageMapping[user.coverPhoto];
        updated = true;
      }

      if (updated) {
        await user.save();
        usersUpdated++;
        console.log(`✓ Updated user: ${user.firstName} ${user.lastName}\n`);
      }
    }

    console.log('✅ Update complete!');
    console.log(`   - Events updated: ${eventsUpdated}`);
    console.log(`   - Users updated: ${usersUpdated}`);
    console.log('\n💡 All images now point to Cloudinary URLs!\n');

  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateDatabase();
