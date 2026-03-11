# Testing Guide - Sewing Circle v3.1

## Pre-Testing Checklist

- [ ] MongoDB is running and accessible
- [ ] Backend `.env` file is configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173

## Test Scenarios

### 1. User Registration

#### Test Case 1.1: Successful Registration
**Steps:**
1. Navigate to http://localhost:5173/register
2. Fill in all required fields:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Optionally fill:
   - Headline: "Software Engineer | Community Builder"
   - Location: "San Francisco, CA"
   - Skills: "JavaScript, React, Node.js"
   - Bio: "Passionate about building communities..."
4. Click "Create Account"

**Expected Result:**
- ✅ Success message appears
- ✅ "Registration successful! Your account is pending admin approval" message
- ✅ Automatic redirect to login page after 3 seconds
- ✅ User created in database with status "pending"

#### Test Case 1.2: Duplicate Email
**Steps:**
1. Try to register with the same email again

**Expected Result:**
- ❌ Error message: "Email already registered"
- ❌ Form not submitted

#### Test Case 1.3: Password Mismatch
**Steps:**
1. Enter different passwords in password and confirm password fields
2. Submit form

**Expected Result:**
- ❌ Error message: "Passwords do not match"
- ❌ Form not submitted

#### Test Case 1.4: Short Password
**Steps:**
1. Enter password with less than 6 characters
2. Submit form

**Expected Result:**
- ❌ Error message: "Password must be at least 6 characters"
- ❌ Form not submitted

### 2. Admin User Management

#### Test Case 2.1: View Pending Users
**Steps:**
1. Login to admin at http://localhost:5173/admin
   - Username: "admin"
   - Password: "follow.admin"
2. Navigate to "General" tab
3. Scroll to User Management section

**Expected Result:**
- ✅ User statistics displayed (total, pending, approved, online)
- ✅ Pending users shown by default
- ✅ John Doe's registration visible
- ✅ All user information displayed correctly

#### Test Case 2.2: Approve User
**Steps:**
1. In User Management section
2. Find John Doe's card
3. Click "Approve" button
4. Confirm action

**Expected Result:**
- ✅ Success alert: "User approved successfully!"
- ✅ User card removed from pending list
- ✅ Statistics updated (pending count decreased)
- ✅ User status in database changed to "approved"

#### Test Case 2.3: Reject User
**Steps:**
1. Register another test user
2. In admin, find the new user
3. Click "Reject" button
4. Enter rejection reason: "Incomplete profile"
5. Confirm

**Expected Result:**
- ✅ Success alert: "User rejected successfully!"
- ✅ User card removed from pending list
- ✅ User status changed to "rejected"
- ✅ Rejection reason saved

#### Test Case 2.4: Search Users
**Steps:**
1. In User Management, enter "John" in search box

**Expected Result:**
- ✅ Only users matching "John" displayed
- ✅ Search works across name, email, headline

#### Test Case 2.5: Filter Users
**Steps:**
1. Click "All Users" filter button
2. Click "Approved" filter button
3. Click "Rejected" filter button

**Expected Result:**
- ✅ Users filtered correctly by status
- ✅ Active filter button highlighted
- ✅ User count matches filter

### 3. User Login

#### Test Case 3.1: Login with Pending Account
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter credentials of pending user
3. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Your account is pending admin approval"
- ❌ Not logged in

#### Test Case 3.2: Login with Approved Account
**Steps:**
1. Navigate to http://localhost:5173/login
2. Enter John Doe's credentials
3. Click "Sign In"

**Expected Result:**
- ✅ Success message
- ✅ Token stored in localStorage
- ✅ Redirected to /feed
- ✅ User data stored in localStorage

#### Test Case 3.3: Login with Rejected Account
**Steps:**
1. Try to login with rejected user credentials

**Expected Result:**
- ❌ Error message: "Your account registration was rejected"
- ❌ Rejection reason displayed
- ❌ Not logged in

#### Test Case 3.4: Invalid Credentials
**Steps:**
1. Enter wrong email or password
2. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Invalid email or password"
- ❌ Not logged in

### 4. User Suspension

#### Test Case 4.1: Suspend User
**Steps:**
1. In admin, filter for "Approved" users
2. Find John Doe
3. Click "Suspend" button
4. Enter reason: "Policy violation"
5. Confirm

**Expected Result:**
- ✅ Success alert: "User suspended successfully!"
- ✅ User status changed to "suspended"
- ✅ User moved to suspended filter

#### Test Case 4.2: Login with Suspended Account
**Steps:**
1. Try to login with suspended user

**Expected Result:**
- ❌ Error message: "Your account has been suspended"
- ❌ Not logged in

#### Test Case 4.3: Reactivate User
**Steps:**
1. In admin, filter for "Suspended" users
2. Find suspended user
3. Click "Reactivate" button
4. Confirm

**Expected Result:**
- ✅ Success alert: "User reactivated successfully!"
- ✅ User status changed to "approved"
- ✅ User can login again

### 5. API Testing

#### Test Case 5.1: Register API
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "headline": "Test Headline"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful! Your account is pending admin approval.",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "status": "pending"
  }
}
```

#### Test Case 5.2: Login API
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

#### Test Case 5.3: Get Pending Users (Admin)
**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/users/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "users": [...]
}
```

### 6. Database Verification

#### Test Case 6.1: Check User Document
**Steps:**
1. Open MongoDB Compass or mongo shell
2. Connect to your database
3. Find the users collection
4. Query for John Doe

**Expected Result:**
- ✅ User document exists
- ✅ Password is hashed (not plain text)
- ✅ Status field is correct
- ✅ All fields populated correctly
- ✅ createdAt and updatedAt timestamps present

#### Test Case 6.2: Check Password Hash
**Steps:**
1. View user document
2. Check password field

**Expected Result:**
- ✅ Password starts with "$2a$" or "$2b$" (bcrypt hash)
- ✅ Password is not readable
- ✅ Password length is 60 characters

### 7. UI/UX Testing

#### Test Case 7.1: Responsive Design
**Steps:**
1. Open registration page
2. Resize browser window to mobile size (375px)
3. Test all form interactions

**Expected Result:**
- ✅ Form adapts to mobile layout
- ✅ All fields accessible
- ✅ Buttons properly sized
- ✅ No horizontal scroll

#### Test Case 7.2: Form Validation
**Steps:**
1. Try to submit empty form
2. Fill only some required fields
3. Submit

**Expected Result:**
- ✅ Browser validation prevents submission
- ✅ Required fields highlighted
- ✅ Clear error messages

#### Test Case 7.3: Loading States
**Steps:**
1. Submit registration form
2. Observe button state

**Expected Result:**
- ✅ Button shows "Creating Account..." text
- ✅ Button is disabled during submission
- ✅ No double submissions possible

### 8. Security Testing

#### Test Case 8.1: JWT Token Expiration
**Steps:**
1. Login and get token
2. Wait 7 days (or modify JWT_SECRET to invalidate)
3. Try to access protected route

**Expected Result:**
- ❌ Token expired error
- ❌ Redirected to login

#### Test Case 8.2: Admin Route Protection
**Steps:**
1. Try to access admin routes without admin token
2. Use user token for admin endpoints

**Expected Result:**
- ❌ 401 Unauthorized
- ❌ "Access denied. Admin only." message

#### Test Case 8.3: SQL Injection Prevention
**Steps:**
1. Try to register with email: `test@test.com'; DROP TABLE users; --`

**Expected Result:**
- ✅ Email treated as string
- ✅ No database manipulation
- ✅ Validation error or safe storage

## Performance Testing

### Test Case 9.1: Load Time
**Steps:**
1. Open Chrome DevTools
2. Navigate to registration page
3. Check Network tab

**Expected Result:**
- ✅ Page loads in < 2 seconds
- ✅ No unnecessary requests
- ✅ Assets cached properly

### Test Case 9.2: API Response Time
**Steps:**
1. Submit registration
2. Check Network tab for API call

**Expected Result:**
- ✅ API responds in < 500ms
- ✅ No timeout errors

## Regression Testing

### Test Case 10.1: Existing Features
**Steps:**
1. Test event creation (existing feature)
2. Test event viewing on main site
3. Test admin event management

**Expected Result:**
- ✅ All existing features still work
- ✅ No breaking changes
- ✅ Events display correctly

## Test Results Template

```
Test Date: ___________
Tester: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 | ✅/❌ | |
| 1.2 | ✅/❌ | |
| 1.3 | ✅/❌ | |
...
```

## Common Issues and Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Check MONGODB_URI in .env file

### Issue: "Port 5000 already in use"
**Solution:** Kill process: `npx kill-port 5000`

### Issue: "Token invalid"
**Solution:** Clear localStorage and login again

### Issue: "User not found after approval"
**Solution:** Refresh admin dashboard

## Automated Testing (Future)

For future implementation:
- Unit tests for backend routes
- Integration tests for API endpoints
- E2E tests with Cypress
- Component tests with React Testing Library

## Sign-Off

- [ ] All test cases passed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation accurate
- [ ] Ready for production

**Tested by:** ___________
**Date:** ___________
**Version:** v3.1
**Status:** ✅ PASSED / ❌ FAILED
