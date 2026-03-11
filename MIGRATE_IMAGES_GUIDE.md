# Image Migration Guide

## Before You Start

Make sure you have:
1. ✅ Cloudinary account created
2. ✅ Cloudinary credentials added to `backend/.env`
3. ✅ Backend dependencies installed (`npm install` in backend folder)

## Step 1: Add Your Cloudinary Credentials

Edit `backend/.env` and add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Get these from: https://cloudinary.com/console

## Step 2: Choose Your Migration Method

### Option A: Upload Images Only (Recommended First)

This uploads all images to Cloudinary without changing the database. Good for testing.

```bash
cd backend
npm run upload-images
```

This will:
- Upload all images from `uploads/` folder to Cloudinary
- Print the Cloudinary URLs
- NOT modify your database

### Option B: Full Migration (Upload + Update Database)

This uploads images AND updates all database records to use Cloudinary URLs.

```bash
cd backend
npm run migrate-images
```

This will:
- Upload all images to Cloudinary
- Update Event records (coverImage, gallery)
- Update User records (profilePicture, coverPhoto)
- Print a summary of changes

## Step 3: Verify in Cloudinary

1. Go to https://cloudinary.com/console/media_library
2. You should see folders:
   - `sewing-circle/events/` - Event images
   - `sewing-circle/profiles/` - Profile pictures
   - `sewing-circle/backgrounds/` - Background images
   - `sewing-circle/posts/` - Post images

## Step 4: Test Your Application

1. Start your backend: `npm start`
2. Check if images load correctly
3. Try uploading a new image (should go directly to Cloudinary)

## Step 5: Clean Up (Optional)

After verifying everything works:

```bash
# Delete local uploads folder (images are now in Cloudinary)
rm -rf uploads/
```

## Troubleshooting

### Error: "Must supply cloud_name"
- Check that `CLOUDINARY_CLOUD_NAME` is set in `.env`
- Make sure you're running the script from the `backend` folder

### Error: "Invalid API key"
- Verify your `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Copy them again from Cloudinary dashboard

### Images not showing after migration
- Check the database to see if URLs were updated
- Verify Cloudinary URLs are accessible (open in browser)
- Check frontend `getImageUrl()` function handles full URLs

## Security Note

✅ Your `.env` file is safe because:
- It's in `.gitignore` (never committed to Git)
- Only exists on your local machine and Render servers
- Cloudinary API secret is never exposed to frontend

## What Happens to Old Images?

After migration:
- Old images remain in `uploads/` folder (you can delete them)
- New uploads go directly to Cloudinary
- Database points to Cloudinary URLs
- No more storage issues on Render!
