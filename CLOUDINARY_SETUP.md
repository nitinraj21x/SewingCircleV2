# Cloudinary Setup Guide

## Why Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- **Free tier**: 25 GB storage, 25 GB bandwidth/month
- **Automatic optimization**: Images are automatically compressed and optimized
- **CDN delivery**: Fast image delivery worldwide
- **No server storage needed**: Perfect for platforms like Render where file storage is ephemeral

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Credentials

1. After logging in, go to your Dashboard: [https://cloudinary.com/console](https://cloudinary.com/console)
2. You'll see your credentials in the "Account Details" section:
   - **Cloud Name**: e.g., `dxxxxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz123456` (click "Reveal" to see it)

## Step 3: Add Credentials to Local Environment

1. Open `AC_SewingCircle/v3.1/backend/.env`
2. Add your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Step 4: Add Credentials to Render

### For Backend Service:

1. Go to your Render dashboard: [https://dashboard.render.com](https://dashboard.render.com)
2. Click on your backend service (sewingcirclebackend)
3. Go to "Environment" tab
4. Add three new environment variables:
   - Key: `CLOUDINARY_CLOUD_NAME`, Value: `your_cloud_name`
   - Key: `CLOUDINARY_API_KEY`, Value: `your_api_key`
   - Key: `CLOUDINARY_API_SECRET`, Value: `your_api_secret`
5. Click "Save Changes"
6. The service will automatically redeploy

## Step 5: Test the Setup

After deployment, test image uploads:

1. **Admin Dashboard**: Try uploading an event with images
2. **User Profile**: Try uploading a profile picture or cover photo
3. **Check Cloudinary**: Go to your Cloudinary Media Library to see uploaded images

## Folder Structure in Cloudinary

Images will be organized in folders:
- `sewing-circle/events/` - Event images
- `sewing-circle/profiles/` - Profile pictures
- `sewing-circle/covers/` - Cover photos

## Image Optimization

All images are automatically:
- Resized to reasonable dimensions (max 2000x2000 for events, 1000x1000 for profiles)
- Compressed with automatic quality settings
- Delivered via CDN for fast loading

## Troubleshooting

### Error: "Invalid cloud_name"
- Double-check your `CLOUDINARY_CLOUD_NAME` is correct
- Make sure there are no extra spaces or quotes

### Error: "Invalid API key"
- Verify your `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Make sure you copied them correctly from the dashboard

### Images not showing
- Check browser console for errors
- Verify the Cloudinary URLs are being returned from the API
- Make sure the frontend `getImageUrl()` function handles Cloudinary URLs (starts with `http`)

## Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

This should be more than enough for a community platform. If you exceed limits, Cloudinary will notify you.

## Next Steps

Once Cloudinary is set up:
1. ✅ Images will be stored in the cloud
2. ✅ No need to worry about Render's ephemeral storage
3. ✅ Images will load faster via CDN
4. ✅ Automatic image optimization

## Support

If you need help:
- Cloudinary Documentation: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- Cloudinary Support: [https://support.cloudinary.com](https://support.cloudinary.com)
