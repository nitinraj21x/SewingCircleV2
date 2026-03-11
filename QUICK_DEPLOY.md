# Quick Deployment Guide - 30 Minutes to Live

This is a streamlined guide to get your Sewing Circle app live in ~30 minutes using free services.

## Prerequisites (5 minutes)
- [ ] GitHub account
- [ ] Code pushed to GitHub repository

## Step 1: Database Setup (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create Free Cluster (M0)
3. Create Database User:
   - Username: `sewingcircle`
   - Password: (generate strong password, save it!)
4. Network Access → Add IP: `0.0.0.0/0`
5. Connect → Get connection string:
   ```
   mongodb+srv://sewingcircle:PASSWORD@cluster0.xxxxx.mongodb.net/sewingcircle
   ```

## Step 2: Image Storage Setup (3 minutes)

1. Go to https://cloudinary.com
2. Sign up for free account
3. Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Deploy Backend (7 minutes)

1. Go to https://render.com → Sign up with GitHub
2. New → Web Service → Connect your repo
3. Configure:
   ```
   Name: sewing-circle-api
   Root Directory: AC_SewingCircle/v3.1/backend
   Build Command: npm install
   Start Command: npm start
   ```
4. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://sewingcircle:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sewingcircle
   JWT_SECRET=generate-random-64-char-string
   JWT_REFRESH_SECRET=generate-another-random-64-char-string
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
5. Create Web Service → Wait for deployment
6. Copy your backend URL: `https://sewing-circle-api.onrender.com`

## Step 4: Deploy Frontend (7 minutes)

1. Go to https://vercel.com → Sign up with GitHub
2. New Project → Import your repo
3. Configure:
   ```
   Framework: Vite
   Root Directory: AC_SewingCircle/v3.1/frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. Add Environment Variable:
   ```
   VITE_API_URL=https://sewing-circle-api.onrender.com
   ```
5. Deploy → Wait for deployment
6. Copy your frontend URL: `https://your-app.vercel.app`

## Step 5: Update Backend CORS (2 minutes)

1. Go back to Render dashboard
2. Environment → Edit `FRONTEND_URL`
3. Set to your Vercel URL: `https://your-app.vercel.app`
4. Save → Backend will redeploy

## Step 6: Seed Database (3 minutes)

On your local machine:
```bash
cd AC_SewingCircle/v3.1/backend
# Update .env with production MongoDB URI
node seed.js
```

## Step 7: Test (3 minutes)

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login as admin (admin / follow.admin)
- [ ] Events display
- [ ] Images load

## Done! 🎉

Your app is now live at: `https://your-app.vercel.app`

## Important Notes

⚠️ **Free Tier Limitations:**
- Backend sleeps after 15 min inactivity (first request takes ~30 seconds)
- 512MB database storage
- Limited bandwidth

💡 **Next Steps:**
- Add custom domain
- Setup monitoring
- Configure email notifications
- Implement backups

## Generate Secure Secrets

```bash
# Run this to generate JWT secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Troubleshooting

**Backend won't start:**
- Check MongoDB URI is correct
- Verify all environment variables are set
- Check Render logs for errors

**Frontend can't connect to backend:**
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Wait for backend to wake up (first request)

**Images not uploading:**
- Verify Cloudinary credentials
- Check backend logs for errors
- Ensure Cloudinary storage is configured

## Support

For detailed deployment options, see `DEPLOYMENT_GUIDE.md`
