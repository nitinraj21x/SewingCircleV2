# Troubleshooting Guide - Sewing Circle v3.1

## User Management Issues

### Issue: Pending users not showing in admin dashboard

#### ✅ FIXED - February 20, 2026

This issue has been resolved. The problem was:
1. Backend middleware expected wrong token format
2. Frontend was looking for wrong token key (`adminToken` instead of `accessToken`)

Both issues have been fixed. See `PENDING_USERS_FIX.md` for details.

#### If you still have issues:

**1. No pending users in database**
- **Check:** Register a new user first
- **Solution:** 
  ```bash
  # Go to http://localhost:5173/register
  # Fill out the form and submit
  # Then check admin dashboard
  ```

**2. Admin token missing or expired**
- **Check:** Look at the debug info in the admin dashboard (development mode)
- **Solution:** 
  - Logout and login again as admin
  - Username: `admin`
  - Password: `follow.admin`

**3. Backend not running**
- **Check:** Visit http://localhost:5000/api/admin/users/pending in browser
- **Solution:**
  ```bash
  cd AC_SewingCircle/v3.1/backend
  npm run dev
  ```

**4. Database connection issue**
- **Check:** Look at backend terminal for MongoDB connection errors
- **Solution:**
  - Verify MONGODB_URI in `.env` file
  - Check MongoDB Atlas allows your IP address
  - Ensure MongoDB cluster is running

**5. CORS issues**
- **Check:** Look at browser console for CORS errors
- **Solution:** Backend should have CORS enabled (already configured)

#### Quick Debug Steps:

1. **Check Backend Logs**
   ```bash
   # In backend terminal, you should see:
   # "Server running on port 5000"
   # "Connected to MongoDB"
   ```

2. **Test API Directly**
   ```bash
   # Get admin token first (login as admin)
   # Then test the endpoint:
   curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/admin/users/pending
   ```

3. **Check MongoDB**
   - Open MongoDB Compass
   - Connect to your database
   - Look in the `users` collection
   - Filter: `{ status: "pending" }`
   - Should see registered users

4. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors
   - Check Network tab for failed requests

5. **Use Debug Info**
   - In development mode, debug info shows at top of User Management
   - Check if admin token is present
   - Check pending users count
   - Verify filter is set to "pending"

#### Manual Database Check:

```javascript
// In MongoDB shell or Compass
db.users.find({ status: "pending" })

// Should return array of pending users
```

#### Force Refresh:

1. Click the "Refresh" button in User Management
2. Or reload the page
3. Or switch to another tab and back to "General"

### Issue: Refresh button not working

**Solution:**
- Check browser console for errors
- Verify admin token is valid
- Try logging out and back in
- Check backend is responding

### Issue: Users show but can't approve/reject

**Possible Causes:**
1. Admin token expired - Login again
2. Backend route error - Check backend logs
3. Network issue - Check browser console

**Solution:**
```bash
# Restart backend
cd AC_SewingCircle/v3.1/backend
npm run dev

# Clear browser cache and reload
# Ctrl + Shift + R (Windows)
# Cmd + Shift + R (Mac)
```

## General Issues

### Backend won't start

**Error: "Port 5000 already in use"**
```bash
# Windows
npx kill-port 5000

# Or change port in .env
PORT=5001
```

**Error: "Cannot connect to MongoDB"**
- Check MONGODB_URI in `.env`
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas
- Test connection string

### Frontend won't start

**Error: "Port 5173 already in use"**
```bash
# Kill the process
npx kill-port 5173

# Or the frontend will suggest another port
```

**Error: "Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Images not loading

**Issue: Profile pictures or cover photos not showing**

**Solution:**
1. Check uploads folder exists: `backend/uploads/profiles/`
2. Verify backend is serving static files
3. Check image paths in database start with `/uploads/`
4. Try uploading a new image

### Login issues

**Error: "Invalid token"**
- Token expired (7 days)
- Clear localStorage and login again
- Check JWT_SECRET in backend `.env`

**Error: "Account pending approval"**
- User needs admin approval first
- Login as admin and approve the user

### API Errors

**401 Unauthorized**
- Token missing or invalid
- Login again
- Check Authorization header

**403 Forbidden**
- Wrong token type (user token for admin route)
- Account not approved
- Account suspended

**500 Server Error**
- Check backend logs
- Database connection issue
- Code error - check stack trace

## Development Tips

### Enable Debug Mode

The UserManagement component shows debug info in development mode automatically.

### Check All Logs

**Backend Terminal:**
```bash
# Should show:
Server running on port 5000
Connected to MongoDB
Found X pending users (when fetching)
```

**Frontend Terminal:**
```bash
# Should show:
VITE v4.x.x ready in Xms
Local: http://localhost:5173/
```

**Browser Console:**
```javascript
// Check localStorage
console.log('Admin Token:', localStorage.getItem('adminToken'));
console.log('User:', localStorage.getItem('user'));

// Check API response
// Look in Network tab for /api/admin/users/pending
```

### Test Flow

1. **Register a user:**
   - Go to http://localhost:5173/register
   - Fill form and submit
   - Should see success message

2. **Check database:**
   - Open MongoDB Compass
   - Find the user with status: "pending"

3. **Login as admin:**
   - Go to http://localhost:5173/admin
   - Username: admin, Password: follow.admin
   - Should redirect to dashboard

4. **Check User Management:**
   - Click "General" tab
   - Scroll to User Management section
   - Should see pending user
   - Click "Refresh" to reload

5. **Approve user:**
   - Click "Approve" button
   - Confirm action
   - User should disappear from pending
   - Check "Approved" filter to see user

### Common Mistakes

1. **Not starting backend** - Frontend needs backend API
2. **Wrong admin credentials** - Use exact credentials
3. **No users registered** - Register at least one user first
4. **Wrong filter selected** - Make sure "Pending" filter is active
5. **Token expired** - Login again if session expired

### Reset Everything

If nothing works, try a fresh start:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clear browser data
# - Open DevTools (F12)
# - Application tab
# - Clear Storage
# - Clear site data

# 3. Restart backend
cd AC_SewingCircle/v3.1/backend
npm run dev

# 4. Restart frontend (new terminal)
cd AC_SewingCircle/v3.1/frontend
npm run dev

# 5. Login as admin again
# 6. Register a new test user
# 7. Check User Management
```

## Getting Help

### Information to Provide

When asking for help, include:

1. **Error message** (exact text)
2. **Browser console logs** (screenshot or copy)
3. **Backend terminal output** (last 20 lines)
4. **Steps to reproduce** (what you did)
5. **Environment:**
   - OS (Windows/Mac/Linux)
   - Node version (`node --version`)
   - Browser (Chrome/Firefox/etc)

### Quick Checks

Before asking for help, verify:
- [ ] Backend is running
- [ ] Frontend is running
- [ ] MongoDB is connected
- [ ] At least one user is registered
- [ ] Logged in as admin
- [ ] Browser console has no errors
- [ ] Network tab shows successful API calls

## Success Indicators

Everything is working when:
- ✅ Backend shows "Connected to MongoDB"
- ✅ Frontend loads without errors
- ✅ Can login as admin
- ✅ User Management section loads
- ✅ Pending users appear (if any registered)
- ✅ Can approve/reject users
- ✅ Refresh button works
- ✅ Statistics update correctly

## Still Having Issues?

1. Check all documentation files
2. Review the TESTING_GUIDE.md
3. Try the QUICK_START.md from scratch
4. Check GitHub issues (if applicable)
5. Ask for help with detailed information

---

**Remember:** Most issues are due to:
1. Backend not running
2. No users registered yet
3. Admin token expired
4. Wrong filter selected

Try these first! 🚀
