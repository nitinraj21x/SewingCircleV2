# Sewing Circle v3.1 - Social Platform Edition

## What's New in v3.1

Version 3.1 transforms the Sewing Circle from an event management system into a professional social networking platform with LinkedIn-style features.

### New Features

#### 1. User Registration & Approval System
- **Public Registration**: Users can register with email and create their professional profiles
- **Admin Approval Workflow**: All new registrations require admin approval before users can access the platform
- **User Management Dashboard**: Admins can view, approve, reject, or suspend user accounts from the General tab

#### 2. User Authentication
- **Secure Login**: JWT-based authentication for registered users
- **Separate Auth Systems**: Distinct authentication for regular users and admins
- **Protected Routes**: User-only areas require authentication

#### 3. Professional User Profiles (Coming Soon - Phase 2)
- Profile pages with work experience, education, and skills
- Profile and cover photo uploads
- Activity feed showing user posts and interactions
- Connection management

#### 4. Social Feed (Coming Soon - Phase 2)
- LinkedIn-style home feed
- Create and share posts
- Like, comment, and share functionality
- Trending topics and hashtags

#### 5. Article System (Coming Soon - Phase 2)
- Write and publish long-form articles
- Rich text editor
- Article discovery and recommendations

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and Navigate**
   ```bash
   cd AC_SewingCircle/v3.1
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
   Create `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Main Site: http://localhost:5173
   - User Registration: http://localhost:5173/register
   - User Login: http://localhost:5173/login
   - Admin Login: http://localhost:5173/admin

### Default Admin Credentials
- Username: `admin`
- Password: `follow.admin`

## User Registration Flow

### For Users:
1. Visit http://localhost:5173/register
2. Fill out the registration form with:
   - First Name & Last Name
   - Email Address
   - Password (min. 6 characters)
   - Professional Headline (optional)
   - Location (optional)
   - Skills (optional, comma-separated)
   - Bio (optional)
3. Submit the form
4. Wait for admin approval (you'll see a success message)
5. Once approved, you can login at http://localhost:5173/login

### For Admins:
1. Login to admin dashboard
2. Go to "General" tab
3. View pending user registrations
4. Review user information
5. Click "Approve" or "Reject" for each user
6. Approved users can now login and access the platform

## API Endpoints

### User Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Admin User Management
- `GET /api/admin/users/pending` - Get pending registrations
- `GET /api/admin/users` - Get all users (with filters)
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/reject` - Reject user
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `PUT /api/admin/users/:id/reactivate` - Reactivate user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/stats/overview` - Get user statistics

### Events (Existing)
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/past` - Get past events
- `POST /api/admin/events` - Create event (admin only)
- `PUT /api/admin/events/:id` - Update event (admin only)
- `DELETE /api/admin/events/:id` - Delete event (admin only)

## Database Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  headline: String (max 120 chars),
  bio: String (max 2000 chars),
  location: String,
  profilePicture: String (URL),
  coverPhoto: String (URL),
  skills: [String],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  connections: [ObjectId],
  followers: [ObjectId],
  following: [ObjectId],
  status: 'pending' | 'approved' | 'rejected' | 'suspended',
  rejectionReason: String,
  lastLogin: Date,
  isOnline: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Admin Dashboard Features

### General Tab
- Dashboard overview with event statistics
- Recent events list
- **User Management Section** (NEW)
  - User statistics (total, pending, approved, online)
  - Filter users by status
  - Search users by name, email, or headline
  - Approve/reject pending registrations
  - Suspend/reactivate user accounts
  - View detailed user profiles

### Event Management Tab
- Create, edit, and delete events
- Search and filter events
- Preview event details
- Manage event images

### Settings Tab
- Admin account settings
- System configuration

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation and sanitization
- Separate admin and user authentication
- Account status verification on login

## Upcoming Features (Phase 2-6)

### Phase 2: User Profiles
- Complete profile pages
- Profile editing
- Experience and education management
- Profile/cover photo uploads

### Phase 3: Social Feed
- Home feed with posts
- Create text, image, and link posts
- Like, comment, and share
- Post visibility controls

### Phase 4: Articles
- Rich text article editor
- Article publishing
- Comments on articles
- Article discovery

### Phase 5: Networking
- Send/accept connection requests
- Connection suggestions
- Search and discovery
- Messaging system

### Phase 6: Polish
- Real-time notifications
- Email notifications
- Mobile responsiveness
- Performance optimization
- Analytics dashboard

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB is running
- Check if port 5000 is available

### Frontend won't start
- Check if backend is running on port 5000
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is available

### Users can't login after approval
- Verify user status is 'approved' in database
- Check JWT_SECRET is set in backend `.env`
- Clear browser localStorage and try again

### Images not displaying
- Ensure uploads folder exists in backend directory
- Check file permissions on uploads folder
- Verify image paths in database start with `/uploads/`

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 5173
- MongoDB connection required
- JWT tokens expire after 7 days
- Admin tokens are separate from user tokens

## Contributing

This is a community project. Future phases will be implemented based on community needs and feedback.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
