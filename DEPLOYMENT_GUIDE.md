# Sewing Circle v3.1 - Complete Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Option 1: Deploy to Vercel (Frontend) + Render (Backend)](#option-1-vercel--render)
5. [Option 2: Deploy to Netlify (Frontend) + Railway (Backend)](#option-2-netlify--railway)
6. [Option 3: Deploy to AWS (Full Stack)](#option-3-aws-full-stack)
7. [Option 4: Deploy to DigitalOcean (VPS)](#option-4-digitalocean-vps)
8. [Database Setup (MongoDB Atlas)](#database-setup)
9. [Environment Variables](#environment-variables)
10. [Post-Deployment Steps](#post-deployment-steps)
11. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

The Sewing Circle v3.1 is a full-stack MERN application consisting of:
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express API
- **Database**: MongoDB
- **File Storage**: Local uploads (needs cloud storage for production)

---

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account (for code repository)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (usually provided by hosting platforms)
- [ ] Cloud storage account for images (AWS S3, Cloudinary, etc.)

---

## Deployment Options

### Quick Comparison

| Platform | Frontend | Backend | Database | Cost | Difficulty |
|----------|----------|---------|----------|------|------------|
| Vercel + Render | ✅ Free | ✅ Free | Atlas Free | $0 | Easy |
| Netlify + Railway | ✅ Free | ✅ Free | Atlas Free | $0 | Easy |
| AWS | EC2/Amplify | EC2/Lambda | Atlas/DocumentDB | $10-50/mo | Medium |
| DigitalOcean | Droplet | Droplet | Atlas/Managed | $12-24/mo | Medium |
| Heroku | ✅ | ✅ | Atlas Free | $0-7/mo | Easy |

**Recommended for Beginners**: Vercel + Render (Option 1)

---

## Option 1: Vercel + Render (Recommended)

### Step 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create a new cluster (M0 Free tier)

2. **Configure Database**
   ```
   - Cluster Name: SewingCircle
   - Cloud Provider: AWS
   - Region: Choose closest to your users
   - Cluster Tier: M0 Sandbox (Free)
   ```

3. **Create Database User**
   - Go to Database Access
   - Add New Database User
   - Username: `sewingcircle_user`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

4. **Whitelist IP Addresses**
   - Go to Network Access
   - Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0` (for production, restrict this)
   - Click Confirm

5. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sewingcircle?retryWrites=true&w=majority
   ```
   - Replace `<username>` and `<password>` with your credentials

### Step 2: Deploy Backend to Render

1. **Prepare Backend for Deployment**
   
   Create `AC_SewingCircle/v3.1/backend/.gitignore`:
   ```
   node_modules/
   .env
   uploads/
   *.log
   ```

2. **Push Code to GitHub**
   ```bash
   cd AC_SewingCircle/v3.1
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/sewing-circle.git
   git push -u origin main
   ```

3. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

4. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: sewing-circle-backend
     Region: Choose closest to users
     Branch: main
     Root Directory: AC_SewingCircle/v3.1/backend
     Runtime: Node
     Build Command: npm install
     Start Command: npm start
     Instance Type: Free
     ```

5. **Add Environment Variables**
   In Render dashboard, add:
   ```
   MONGODB_URI=mongodb+srv://sewingcircle_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sewingcircle?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://sewing-circle-backend.onrender.com`

### Step 3: Setup Cloud Storage (Cloudinary)

Since Render's filesystem is ephemeral, use Cloudinary for images:

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for free account

2. **Get Credentials**
   - Dashboard → Account Details
   - Note: Cloud Name, API Key, API Secret

3. **Install Cloudinary in Backend**
   ```bash
   cd AC_SewingCircle/v3.1/backend
   npm install cloudinary multer-storage-cloudinary
   ```

4. **Update Backend Code**
   
   Create `backend/config/cloudinary.js`:
   ```javascript
   const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'sewing-circle',
       allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
       transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
     }
   });

   module.exports = { cloudinary, storage };
   ```

5. **Update Upload Routes**
   
   In `backend/routes/upload.js`, replace multer disk storage with Cloudinary storage:
   ```javascript
   const multer = require('multer');
   const { storage } = require('../config/cloudinary');

   const upload = multer({ storage });
   ```

6. **Add Cloudinary Environment Variables to Render**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Step 4: Deploy Frontend to Vercel

1. **Update Frontend API URL**
   
   Create `AC_SewingCircle/v3.1/frontend/.env.production`:
   ```
   VITE_API_URL=https://sewing-circle-backend.onrender.com
   ```

2. **Update API Configuration**
   
   In `frontend/src/services/api.js` or wherever axios is configured:
   ```javascript
   import axios from 'axios';

   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

   const api = axios.create({
     baseURL: `${API_URL}/api`,
     headers: {
       'Content-Type': 'application/json'
     }
   });

   export default api;
   ```

3. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

4. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     ```
     Framework Preset: Vite
     Root Directory: AC_SewingCircle/v3.1/frontend
     Build Command: npm run build
     Output Directory: dist
     Install Command: npm install
     ```

5. **Add Environment Variables**
   ```
   VITE_API_URL=https://sewing-circle-backend.onrender.com
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Your site will be live at: `https://your-project.vercel.app`

7. **Update Backend CORS**
   
   In Render, update `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```

### Step 5: Configure Custom Domain (Optional)

**For Vercel (Frontend):**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `sewingcircle.com`)
3. Update DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

**For Render (Backend):**
1. Go to Settings → Custom Domain
2. Add subdomain (e.g., `api.sewingcircle.com`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```

---

## Option 2: Netlify + Railway

### Step 1: Setup MongoDB Atlas
(Same as Option 1, Step 1)

### Step 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Root Directory: `AC_SewingCircle/v3.1/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   (Same as Option 1, Step 2, #5)

5. **Generate Domain**
   - Go to Settings → Networking
   - Generate Domain
   - Note URL: `https://your-app.up.railway.app`

### Step 3: Deploy Frontend to Netlify

1. **Create Netlify Account**
   - Go to https://www.netlify.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select repository

3. **Configure Build Settings**
   ```
   Base directory: AC_SewingCircle/v3.1/frontend
   Build command: npm run build
   Publish directory: AC_SewingCircle/v3.1/frontend/dist
   ```

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   ```
   VITE_API_URL=https://your-app.up.railway.app
   ```

5. **Configure Redirects**
   
   Create `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

6. **Deploy**
   - Click "Deploy site"
   - Your site: `https://your-site.netlify.app`

---

## Option 3: AWS (Full Stack)

### Architecture
- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or Elastic Beanstalk
- **Database**: MongoDB Atlas or DocumentDB
- **Storage**: S3 for uploads

### Step 1: Setup MongoDB
(Use MongoDB Atlas as in Option 1, or AWS DocumentDB)

### Step 2: Deploy Backend to EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (free tier)
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/sewing-circle.git
   cd sewing-circle/AC_SewingCircle/v3.1/backend
   npm install
   ```

5. **Create Environment File**
   ```bash
   nano .env
   ```
   Add all environment variables

6. **Start with PM2**
   ```bash
   pm2 start server.js --name sewing-circle-api
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/sewing-circle
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sewing-circle /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Step 3: Deploy Frontend to S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd AC_SewingCircle/v3.1/frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket: `sewingcircle-frontend`
   - Enable static website hosting
   - Bucket Policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::sewingcircle-frontend/*"
       }
     ]
   }
   ```

3. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://sewingcircle-frontend/
   ```

4. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Default Root Object: `index.html`
   - Error Pages: 404 → /index.html (for SPA routing)
   - SSL Certificate: Request from ACM

5. **Update DNS**
   - Point your domain to CloudFront distribution

---

## Option 4: DigitalOcean (VPS)

### Step 1: Create Droplet

1. **Create DigitalOcean Account**
   - Go to https://www.digitalocean.com

2. **Create Droplet**
   - Image: Ubuntu 22.04 LTS
   - Plan: Basic ($6/month)
   - Add SSH key

3. **Connect to Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

### Step 2: Setup Server

1. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs
   npm install -g pm2
   ```

3. **Install Nginx**
   ```bash
   apt install nginx -y
   ```

4. **Clone and Setup Backend**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/sewing-circle.git
   cd sewing-circle/AC_SewingCircle/v3.1/backend
   npm install
   ```

5. **Create .env File**
   ```bash
   nano .env
   ```
   Add all environment variables

6. **Start Backend with PM2**
   ```bash
   pm2 start server.js --name sewing-circle-api
   pm2 startup
   pm2 save
   ```

7. **Build and Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

8. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/sewing-circle
   ```

   Add configuration:
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Frontend
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       root /var/www/sewing-circle/AC_SewingCircle/v3.1/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/sewing-circle /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. **Setup SSL**
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
   ```

10. **Setup Firewall**
    ```bash
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw enable
    ```

---

## Database Setup (MongoDB Atlas)

### Detailed Configuration

1. **Create Database**
   - Database Name: `sewingcircle`
   - Collections will be created automatically by Mongoose

2. **Seed Initial Data**
   
   On your local machine:
   ```bash
   cd AC_SewingCircle/v3.1/backend
   node seed.js
   ```

3. **Create Indexes**
   
   In MongoDB Atlas → Collections → Indexes:
   ```javascript
   // Users collection
   { email: 1 } // unique
   { status: 1 }
   { createdAt: -1 }

   // Events collection
   { date: 1 }
   { status: 1 }

   // Posts collection
   { author: 1, createdAt: -1 }
   { createdAt: -1 }
   ```

4. **Setup Backup**
   - Go to Backup tab
   - Enable Cloud Backup (available on paid tiers)
   - Or use `mongodump` for manual backups:
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup
   ```

---

## Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sewingcircle?retryWrites=true&w=majority

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional, for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env.production)

```env
# API URL
VITE_API_URL=https://api.yourdomain.com

# EmailJS (for contact form)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### How to Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Post-Deployment Steps

### 1. Test All Functionality

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Events display correctly
- [ ] Image uploads work
- [ ] Profile pages load
- [ ] Feed displays posts
- [ ] API endpoints respond

### 2. Setup Monitoring

**Backend Monitoring (Render/Railway):**
- Enable health checks
- Setup uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)

**Frontend Monitoring (Vercel/Netlify):**
- Enable analytics
- Setup error tracking
- Monitor Core Web Vitals

### 3. Configure Backups

**Database:**
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="./backups/backup_$DATE"
```

**Automate with cron:**
```bash
0 2 * * * /path/to/backup-script.sh
```

### 4. Setup Email Notifications

Install nodemailer in backend:
```bash
npm install nodemailer
```

Configure email service for:
- User registration confirmation
- Admin approval notifications
- Password reset emails

### 5. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add helmet.js for security headers
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated

### 6. Performance Optimization

**Backend:**
```javascript
// Add compression
const compression = require('compression');
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

**Frontend:**
- Enable Vercel/Netlify CDN
- Optimize images (use WebP)
- Lazy load components
- Code splitting

### 7. SEO Setup

Create `frontend/public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

Add meta tags in `index.html`:
```html
<meta name="description" content="Sewing Circle - Professional networking platform">
<meta property="og:title" content="Sewing Circle">
<meta property="og:description" content="Connect, share, and grow professionally">
<meta property="og:image" content="https://yourdomain.com/og-image.jpg">
```

---

## Monitoring & Maintenance

### Health Checks

**Backend Health Endpoint:**

Add to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

### Logging

Install Winston:
```bash
npm install winston
```

Configure logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Error Tracking

Setup Sentry:
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### Database Maintenance

**Regular Tasks:**
- Monitor database size
- Review slow queries
- Optimize indexes
- Clean up old data
- Backup regularly

**MongoDB Atlas Monitoring:**
- Go to Metrics tab
- Monitor: CPU, Memory, Connections, Operations
- Set up alerts for high usage

### Update Strategy

1. **Test Updates Locally**
   ```bash
   npm outdated
   npm update
   npm audit fix
   ```

2. **Deploy to Staging First**
   - Create staging environment
   - Test thoroughly
   - Monitor for issues

3. **Deploy to Production**
   - Schedule during low-traffic hours
   - Have rollback plan ready
   - Monitor closely after deployment

### Scaling Considerations

**When to Scale:**
- Response times > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Database connections maxed out

**Scaling Options:**
- Upgrade server tier
- Add load balancer
- Implement caching (Redis)
- Use CDN for static assets
- Database read replicas

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**2. Images Not Loading**
- Check Cloudinary configuration
- Verify image URLs in database
- Check CORS for image requests

**3. Database Connection Fails**
- Verify MongoDB URI
- Check IP whitelist in Atlas
- Ensure database user has correct permissions

**4. JWT Token Issues**
- Verify JWT_SECRET matches
- Check token expiration
- Clear browser localStorage

**5. Build Failures**
- Check Node version compatibility
- Clear node_modules and reinstall
- Verify environment variables

### Getting Help

- Check application logs
- Review error messages
- Search documentation
- Contact hosting support
- Community forums

---

## Cost Estimation

### Free Tier (Recommended for Starting)
- **Frontend**: Vercel/Netlify (Free)
- **Backend**: Render/Railway (Free with limitations)
- **Database**: MongoDB Atlas M0 (Free, 512MB)
- **Storage**: Cloudinary (Free, 25GB)
- **Total**: $0/month

**Limitations:**
- Backend sleeps after inactivity (30 min)
- Limited bandwidth
- No custom domains on some platforms

### Production Tier
- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Render Standard ($7/month)
- **Database**: MongoDB Atlas M10 ($57/month)
- **Storage**: Cloudinary Plus ($99/month)
- **Domain**: $12/year
- **Total**: ~$183/month

### Enterprise Tier
- **Frontend**: AWS CloudFront + S3 ($50/month)
- **Backend**: AWS EC2 t3.medium ($30/month)
- **Database**: MongoDB Atlas M30 ($200/month)
- **Storage**: AWS S3 ($50/month)
- **Load Balancer**: $20/month
- **Total**: ~$350/month

---

## Conclusion

This guide covers multiple deployment options for the Sewing Circle v3.1 application. Choose the option that best fits your:
- Technical expertise
- Budget
- Scalability needs
- Maintenance capacity

**Recommended Path:**
1. Start with Free Tier (Vercel + Render)
2. Monitor usage and performance
3. Upgrade components as needed
4. Scale gradually based on growth

For questions or issues, refer to the main README.md or contact the development team.

---

## Quick Start Checklist

- [ ] Setup MongoDB Atlas
- [ ] Push code to GitHub
- [ ] Deploy backend (Render/Railway)
- [ ] Setup Cloudinary for images
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Configure environment variables
- [ ] Update CORS settings
- [ ] Test all functionality
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Add custom domain (optional)
- [ ] Setup SSL certificates
- [ ] Configure email notifications
- [ ] Implement security measures
- [ ] Optimize performance
- [ ] Launch! 🚀
