# Quick Start Guide - Sewing Circle v3.1

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies

```bash
# Backend
cd AC_SewingCircle/v3.1/backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Access the Application

- 🌐 Main Site: http://localhost:5173
- 📝 Register: http://localhost:5173/register
- 🔐 Login: http://localhost:5173/login
- 👨‍💼 Admin: http://localhost:5173/admin

### Step 5: Test the Flow

1. **Register a Test User**
   - Go to http://localhost:5173/register
   - Fill in the form
   - Submit

2. **Approve as Admin**
   - Login to admin at http://localhost:5173/admin
   - Username: `admin`
   - Password: `follow.admin`
   - Go to "General" tab
   - Find your pending user
   - Click "Approve"

3. **Login as User**
   - Go to http://localhost:5173/login
   - Use your registered email and password
   - You're in!

## 🎯 What You Can Do Now

### As a User:
- ✅ Register with email
- ✅ Create professional profile
- ✅ Login after approval
- ⏳ View events (existing feature)
- ⏳ User profile page (coming in Phase 2)
- ⏳ Social feed (coming in Phase 2)

### As an Admin:
- ✅ Manage user registrations
- ✅ Approve/reject users
- ✅ Suspend/reactivate accounts
- ✅ View user statistics
- ✅ Search and filter users
- ✅ Manage events (existing feature)

## 📊 Admin Dashboard Overview

### General Tab
- Event statistics
- Recent events
- **User Management** (NEW!)
  - Pending registrations
  - User statistics
  - Approve/reject workflow
  - User search and filters

### Event Management Tab
- Create/edit/delete events
- Event search and filters
- Image management

### Settings Tab
- Admin settings
- Configuration

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `follow.admin`

**Test User:** (Create your own via registration)

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Check your MONGODB_URI in `.env`
- Ensure MongoDB Atlas allows your IP
- Verify network connection

### "Port 5000 already in use"
- Kill the process: `npx kill-port 5000`
- Or change PORT in `.env`

### "User can't login after approval"
- Verify user status is 'approved' in MongoDB
- Check JWT_SECRET is set
- Clear browser cache/localStorage

## 📝 Next Steps

1. ✅ Complete Phase 1 (User Registration & Approval) - DONE!
2. 🔄 Phase 2: User Profile Pages
3. 🔄 Phase 3: Social Feed
4. 🔄 Phase 4: Articles System
5. 🔄 Phase 5: Networking Features
6. 🔄 Phase 6: Polish & Enhancement

## 💡 Tips

- Use Chrome DevTools to inspect API calls
- Check browser console for errors
- Monitor backend terminal for server logs
- Use MongoDB Compass to view database

## 🎉 You're Ready!

The foundation is set. Users can now register, get approved by admins, and login to the platform. The next phases will add profile pages, social feed, articles, and networking features to create a complete LinkedIn-style professional community platform!
