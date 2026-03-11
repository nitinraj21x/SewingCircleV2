# Add Cloudinary to Render

## Step 1: Add Environment Variables to Backend

1. Go to https://dashboard.render.com
2. Click on your **backend service** (sewingcirclebackend)
3. Go to the **Environment** tab
4. Click **Add Environment Variable** and add these three:

```
CLOUDINARY_CLOUD_NAME = dnwpnituv
CLOUDINARY_API_KEY = 916491647142289
CLOUDINARY_API_SECRET = pQ5a66Xh-tP0DajNuRaijULInN0
```

5. Click **Save Changes**
6. The backend will automatically redeploy

## Step 2: Wait for Deployment

- Watch the logs to ensure deployment succeeds
- Look for "Connected to MongoDB" message
- Backend should start successfully

## Step 3: Test Image Upload

Once deployed, test the image functionality:

1. **Admin Dashboard**: Upload an event with images
2. **User Profile**: Upload profile picture or cover photo
3. **Verify**: Images should now be stored in Cloudinary

## What Changed?

✅ **Before**: Images stored in Render's ephemeral storage (lost on redeploy)
✅ **After**: Images stored in Cloudinary (permanent, CDN-delivered)

## Migration Summary

- ✅ 28 existing images uploaded to Cloudinary
- ✅ 6 events updated with Cloudinary URLs
- ✅ All new uploads will go to Cloudinary
- ✅ Images accessible via CDN worldwide

## Verify Images in Cloudinary

Visit: https://cloudinary.com/console/media_library

You should see folders:
- `sewing-circle/events/` - 24 images
- `sewing-circle/backgrounds/` - 4 images

## Next Steps

After Render redeploys:
1. Test admin login
2. Try uploading a new event with images
3. Verify images display correctly
4. Check that old events still show their images

## Security Note

✅ Your Cloudinary credentials are safe:
- Stored securely in Render's encrypted environment variables
- Never exposed to frontend
- Not in Git repository
