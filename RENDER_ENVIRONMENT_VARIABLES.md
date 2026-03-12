# Render Environment Variables Setup

## Backend Service Environment Variables

Go to https://dashboard.render.com → Your Backend Service → Environment Tab

Add ALL of these environment variables:

### 1. MongoDB Connection
```
MONGODB_URI = mongodb+srv://nitinraj25:zret7VKeEbQoTHfg@expercluster.rr7dm0x.mongodb.net/sewingcircle?retryWrites=true&w=majority&appName=ExperCluster
```

### 2. JWT Secrets
```
JWT_SECRET = 153dc64d14675a55e40b24719993166be39b9376def1fcb529f8c39b7df0e6b2c946a1a225da8fa8f94f6107f333c54c91b09bffcfb0e3db6ab051d8d5294ad58

JWT_REFRESH_SECRET = d68206a44efb2d38db53cda9a08d1bf9eb26b102ad0d6043ef730203340a47db7b9ea00c49c37572ac07f50508b2670ea3ac5bf82b9914db7493926a23df76f4
```

### 3. Server Configuration
```
PORT = 5000
NODE_ENV = production
```

### 4. Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME = dnwpnituv
CLOUDINARY_API_KEY = 916491647142289
CLOUDINARY_API_SECRET = pQ5a66Xh-tP0DajNuRaijULInN0
```

## Frontend Service Environment Variables

Go to https://dashboard.render.com → Your Frontend Service → Environment Tab

Add this environment variable:

```
VITE_API_URL = https://sewingcirclebackend.onrender.com
```

## MongoDB Atlas IP Whitelist

If the connection still fails after adding environment variables:

1. Go to https://cloud.mongodb.com
2. Click on your cluster (ExperCluster)
3. Go to "Network Access" in the left sidebar
4. Click "Add IP Address"
5. Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"

**Note**: This allows connections from any IP. For production, you should whitelist specific Render IPs, but "Allow Access from Anywhere" is fine for testing.

## How to Add Environment Variables in Render

1. Go to https://dashboard.render.com
2. Click on your service (backend or frontend)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Enter the Key and Value
6. Click "Save Changes"
7. The service will automatically redeploy

## Verify Environment Variables

After adding, you should see them listed in the Environment tab. The values will be hidden for security.

## Common Issues

### "buffering timed out" error
- **Cause**: MONGODB_URI not set or MongoDB Atlas blocking connection
- **Fix**: Add MONGODB_URI and whitelist IPs in MongoDB Atlas

### "Invalid credentials" error
- **Cause**: JWT_SECRET or JWT_REFRESH_SECRET not set
- **Fix**: Add both JWT secrets

### Images not uploading
- **Cause**: Cloudinary credentials not set
- **Fix**: Add all three Cloudinary variables

### Frontend can't connect to backend
- **Cause**: VITE_API_URL not set or incorrect
- **Fix**: Set VITE_API_URL to backend URL

## After Adding Variables

1. Save changes in Render
2. Wait for automatic redeploy (2-3 minutes)
3. Check logs for "Connected to MongoDB"
4. Test admin login

## Security Note

✅ These environment variables are:
- Encrypted by Render
- Never exposed in logs
- Not accessible from frontend
- Safe to use in production
