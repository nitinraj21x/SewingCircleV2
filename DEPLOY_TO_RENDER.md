# Deploy Sewing Circle to Render

Complete guide to deploy both frontend and backend to Render using MongoDB Atlas.

---

## 📋 Prerequisites

Before starting, you need:

1. **GitHub Account** - Code must be in a GitHub repository
2. **Render Account** - Sign up at https://render.com (free)
3. **MongoDB Atlas Account** - Sign up at https://www.mongodb.com/cloud/atlas (free)
4. **Cloudinary Account** - Sign up at https://cloudinary.com (free)

---

## 🗂️ Project Structure

```
AC_SewingCircle/v3.1/
├── backend/              # Node.js + Express API
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/             # React + Vite
│   ├── index.html
│   ├── package.json
│   └── ...
└── README.md
```

---

## Part 1: Setup MongoDB Atlas (5 minutes)

### 1. Create Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Click **"Build a Database"**
4. Choose **M0 FREE** tier
5. Select cloud provider and region (closest to you)
6. Click **"Create"**

### 2. Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `sewingcircle`
5. Password: Click **"Autogenerate Secure Password"** (save this!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 3. Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
4. Click **"Confirm"**

### 4. Get Connection String

1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://sewingcircle:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name before the `?`:
   ```
   mongodb+srv://sewingcircle:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sewingcircle?retryWrites=true&w=majority
   ```

---

## Part 2: Setup Cloudinary (3 minutes)

### 1. Create Account

1. Go to https://cloudinary.com
2. Sign up for free account
3. Verify your email

### 2. Get Credentials

1. Go to **Dashboard**
2. Note these values:
   - **Cloud Name**: (e.g., `dxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (click "eye" icon to reveal)

---

## Part 3: Push Code to GitHub (2 minutes)

If not already done:

```bash
cd AC_SewingCircle/v3.1
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin https://github.com/nitinraj21x/SewingCircle.git
git push -u origin main
```

---

## Part 4: Deploy Backend to Render (7 minutes)

### 1. Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** → Connect GitHub
4. Select repository: **SewingCircle**
5. Click **"Connect"**

### 2. Configure Service

Fill in these settings:

**Basic Settings:**
```
Name: sewing-circle-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: AC_SewingCircle/v3.1/backend
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
```
Free (for testing - sleeps after 15 min)
OR
Starter - $7/month (recommended for production - always on)
```

### 3. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```env
MONGODB_URI
Value: mongodb+srv://sewingcircle:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sewingcircle?retryWrites=true&w=majority

JWT_SECRET
Value: (generate using command below)

JWT_REFRESH_SECRET
Value: (generate using command below)

PORT
Value: 5000

NODE_ENV
Value: production

FRONTEND_URL
Value: https://sewing-circle-frontend.onrender.com

CLOUDINARY_CLOUD_NAME
Value: your_cloud_name

CLOUDINARY_API_KEY
Value: your_api_key

CLOUDINARY_API_SECRET
Value: your_api_secret
```

**Generate JWT Secrets:**
```bash
# Run this twice to get two different secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, copy your backend URL:
   ```
   https://sewing-circle-backend.onrender.com
   ```

---

## Part 5: Deploy Frontend to Render (5 minutes)

### 1. Create Static Site

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Select repository: **SewingCircle**
4. Click **"Connect"**

### 2. Configure Site

Fill in these settings:

**Basic Settings:**
```
Name: sewing-circle-frontend
Branch: main
Root Directory: AC_SewingCircle/v3.1/frontend
```

**Build Settings:**
```
Build Command: npm install && npm run build
Publish Directory: dist
```

**Auto-Deploy:**
```
✅ Yes
```

### 3. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

```env
VITE_API_URL
Value: https://sewing-circle-backend.onrender.com
```

(Replace with your actual backend URL from Part 4)

### 4. Deploy

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for deployment
3. Once deployed, copy your frontend URL:
   ```
   https://sewing-circle-frontend.onrender.com
   ```

---

## Part 6: Update Backend CORS (2 minutes)

Now that frontend is deployed, update backend to allow requests from it:

1. Go to **backend service** on Render
2. Click **"Environment"** (left sidebar)
3. Find **FRONTEND_URL** variable
4. Click **"Edit"**
5. Update value to your actual frontend URL:
   ```
   https://sewing-circle-frontend.onrender.com
   ```
6. Click **"Save Changes"**
7. Backend will automatically redeploy (takes 2-3 minutes)

---

## Part 7: Seed Database (3 minutes)

Create admin user and sample data:

### On Your Local Machine:

```bash
cd AC_SewingCircle/v3.1/backend

# Create temporary .env file with production MongoDB URI
echo "MONGODB_URI=mongodb+srv://sewingcircle:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sewingcircle?retryWrites=true&w=majority" > .env

# Run seed script
node seed.js

# Delete temporary .env file
rm .env
```

This creates:
- Admin user (username: `admin`, password: `follow.admin`)
- Sample events (optional)

---

## ✅ Test Your Deployment

### 1. Visit Your Site

Open: `https://sewing-circle-frontend.onrender.com`

### 2. Test Checklist

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Can access `/register` page
- [ ] Can access `/login` page
- [ ] Can access `/admin` page
- [ ] Events display (if seeded)
- [ ] Images load
- [ ] No console errors (press F12)

### 3. Test Admin Login

1. Go to: `https://sewing-circle-frontend.onrender.com/admin`
2. Username: `admin`
3. Password: `follow.admin`
4. Should successfully login to admin dashboard

### 4. Test User Registration

1. Go to: `https://sewing-circle-frontend.onrender.com/register`
2. Fill out registration form
3. Submit
4. Should see success message

---

## 🔧 Troubleshooting

### Backend Build Fails

**Error:** `Cannot find package.json`

**Fix:** Check Root Directory is set to: `AC_SewingCircle/v3.1/backend`

---

### Backend Won't Start

**Error:** `MongoDB connection failed`

**Fix:** 
1. Verify MongoDB URI is correct
2. Check password has no special characters that need encoding
3. Ensure IP whitelist includes `0.0.0.0/0`

---

### Frontend Can't Connect to Backend

**Error:** `Network Error` or CORS errors in console

**Fix:**
1. Verify `VITE_API_URL` in frontend matches backend URL exactly
2. Verify `FRONTEND_URL` in backend matches frontend URL exactly
3. Wait for backend to wake up (if using free tier, first request takes ~30 seconds)

---

### Images Not Uploading

**Error:** `Upload failed`

**Fix:**
1. Verify all Cloudinary credentials are correct
2. Check Cloudinary dashboard for errors
3. Ensure API secret is copied correctly (no extra spaces)

---

### Backend Sleeps (Free Tier)

**Issue:** First request after 15 minutes takes 30+ seconds

**Fix:** 
- This is normal for free tier
- Upgrade to Starter plan ($7/month) for always-on backend
- Or use UptimeRobot to ping backend every 14 minutes

---

## 📊 Your Deployment URLs

After deployment, save these URLs:

```
Frontend: https://sewing-circle-frontend.onrender.com
Backend:  https://sewing-circle-backend.onrender.com
Admin:    https://sewing-circle-frontend.onrender.com/admin
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `follow.admin`

⚠️ **Change admin password immediately after first login!**

---

## 💰 Cost Breakdown

### Free Tier (Testing/MVP)
- Backend: Free (sleeps after 15 min)
- Frontend: Free (always on)
- MongoDB Atlas: Free (512MB)
- Cloudinary: Free (25GB storage)
- **Total: $0/month**

### Production Tier
- Backend: Starter $7/month (always on)
- Frontend: Free
- MongoDB Atlas: M2 $9/month (2GB)
- Cloudinary: Plus $99/month (or stay on free)
- **Total: $16-115/month**

---

## 🔄 Updating Your Deployment

### Auto-Deploy (Enabled by Default)

Every time you push to GitHub `main` branch:
1. Render automatically detects changes
2. Rebuilds and redeploys affected services
3. Takes 3-10 minutes

### Manual Deploy

1. Go to service on Render
2. Click **"Manual Deploy"**
3. Select branch: `main`
4. Click **"Deploy"**

---

## 🔐 Security Checklist

After deployment:

- [ ] Change admin password from default
- [ ] Use strong JWT secrets (64+ characters)
- [ ] HTTPS is enabled (automatic on Render)
- [ ] CORS is configured correctly (not allowing all origins)
- [ ] MongoDB IP whitelist is set
- [ ] Environment variables are not exposed in code
- [ ] `.env` files are in `.gitignore`

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Go to frontend service → **Settings** → **Custom Domain**
2. Click **"Add Custom Domain"**
3. Enter: `www.yourdomain.com`
4. Update DNS at your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: sewing-circle-frontend.onrender.com
   ```

### Add Custom Domain to Backend

1. Go to backend service → **Settings** → **Custom Domain**
2. Click **"Add Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: sewing-circle-backend.onrender.com
   ```

5. **Update Environment Variables:**
   - Backend `FRONTEND_URL`: `https://www.yourdomain.com`
   - Frontend `VITE_API_URL`: `https://api.yourdomain.com`

---

## 🎉 Success!

Your Sewing Circle application is now live on Render!

**Next Steps:**
1. Test all features thoroughly
2. Change admin password
3. Setup monitoring (UptimeRobot)
4. Configure backups
5. Add custom domain (optional)
6. Share with users!

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Cloudinary**: https://cloudinary.com/documentation

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Frontend URL:** ___________  
**Backend URL:** ___________
