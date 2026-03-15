# Deploy Sewing Circle v3.2 to Render

---

## Prerequisites

- GitHub account with a repo named **v3.2**
- Render account (https://render.com)
- MongoDB Atlas cluster (already configured — same as v3.1)

---

## Step 1: Push to GitHub

```bash
cd AC_SewingCircle/v3.2GIT
git init
git add .
git commit -m "Initial commit - v3.2"
git branch -M main
git remote add origin https://github.com/nitinraj21x/v3.2.git
git push -u origin main
```

> Note: `backend/.env` is gitignored — you will set those values as environment variables in Render directly.

---

## Step 2: Deploy Backend (Web Service)

1. Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo: `v3.2`
3. Configure:

| Setting | Value |
|---|---|
| Name | `sewing-circle-v32-backend` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

4. Add Environment Variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://nitinraj25:zret7VKeEbQoTHfg@expercluster.rr7dm0x.mongodb.net/sewingcircle?retryWrites=true&w=majority&appName=ExperCluster` |
| `JWT_SECRET` | `153dc64d14675a55e40b24719993166be39b9376def1fcb529f8c39b7df0e6b2c946a1a225da8fa8f94f6107f333c54c91b09bffcfb0e3db6ab051d8d5294ad58` |
| `JWT_REFRESH_SECRET` | `d68206a44efb2d38db53cda9a08d1bf9eb26b102ad0d6043ef730203340a47db7b9ea00c49c37572ac07f50508b2670ea3ac5bf82b9914db7493926a23df76f4` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://sewing-circle-v32-frontend.onrender.com` *(update after frontend deploys)* |

5. Click **Create Web Service** — wait for deploy.
6. Copy your backend URL: `https://sewing-circle-v32-backend.onrender.com`

---

## Step 3: Deploy Frontend (Static Site)

1. Render Dashboard → **New +** → **Static Site**
2. Connect same repo: `v3.2`
3. Configure:

| Setting | Value |
|---|---|
| Name | `sewing-circle-v32-frontend` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

4. Add Environment Variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://sewing-circle-v32-backend.onrender.com` |

5. Click **Create Static Site** — wait for deploy.

---

## Step 4: Update Backend CORS

Once frontend is live, go to your **backend service** on Render:

- Environment → `FRONTEND_URL` → update to your actual frontend URL
- Save → backend redeploys automatically

---

## Step 5: Seed the Database (if needed)

Run locally against the Atlas DB:

```bash
cd backend
node seed.js
```

This creates the admin user (`admin` / `follow.admin`).

---

## Image Uploads Note

Render's filesystem is **ephemeral** — uploaded images will be lost on redeploy. For production image persistence, consider:
- Cloudinary (free tier)
- AWS S3
- Render Disk (paid add-on)

For now, the app works but uploaded images won't persist across deploys.

---

## URLs After Deployment

```
Frontend:  https://sewing-circle-v32-frontend.onrender.com
Backend:   https://sewing-circle-v32-backend.onrender.com
Admin:     https://sewing-circle-v32-frontend.onrender.com/admin
```

Default admin: `admin` / `follow.admin` — change after first login.
