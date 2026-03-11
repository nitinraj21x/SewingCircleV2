# Sewing Circle v3.1 - Social Platform Implementation Plan

## Overview
Transform the Sewing Circle from an event management system into a full-featured professional social networking platform similar to LinkedIn.

## Core Features to Implement

### 1. User Registration & Approval System
- **User Registration**
  - Email-based registration form
  - User profile information collection (name, bio, skills, interests)
  - Profile picture upload
  - Status: "pending" by default

- **Admin Approval Workflow**
  - New "User Management" section in admin dashboard (General tab)
  - List of pending user registrations
  - Approve/Reject functionality
  - Email notifications on approval/rejection

- **User Authentication**
  - JWT-based authentication for regular users
  - Separate from admin authentication
  - Protected routes for logged-in users

### 2. User Profile Page (LinkedIn-style)
- **Profile Components**
  - Profile header (cover photo, profile picture, name, headline)
  - About section (bio, location, contact info)
  - Experience section (work history)
  - Education section
  - Skills & endorsements
  - Projects/Portfolio section
  - Activity feed (user's posts and interactions)

- **Profile Actions**
  - Edit profile (own profile only)
  - View other users' profiles
  - Connect/Follow functionality

### 3. Home Feed (LinkedIn-style)
- **Feed Components**
  - Create post section (text, images, links)
  - Feed of posts from connections and community
  - Post interactions (like, comment, share)
  - Trending topics/hashtags
  - Suggested connections
  - Event announcements

- **Post Types**
  - Text posts
  - Image posts
  - Article shares
  - Event announcements
  - Poll posts

### 4. Article/Blog System
- **Article Creation**
  - Rich text editor
  - Cover image upload
  - Tags/categories
  - Draft/Publish status
  - SEO metadata

- **Article Display**
  - Article feed
  - Individual article pages
  - Author information
  - Comments section
  - Related articles

### 5. Networking Features
- **Connections**
  - Send/accept connection requests
  - Connection list
  - Mutual connections
  - Connection suggestions

- **Messaging** (Phase 2)
  - Direct messaging between connections
  - Group messaging
  - Message notifications

### 6. Search & Discovery
- **Search Functionality**
  - Search users by name, skills, location
  - Search posts and articles
  - Search events
  - Advanced filters

- **Discovery Features**
  - "People you may know" suggestions
  - Trending posts
  - Popular articles
  - Upcoming events

## Technical Implementation

### Backend (Node.js/Express)

#### New Models
1. **User Model**
   ```javascript
   {
     email, password, name, headline, bio, location,
     profilePicture, coverPhoto, skills[], experience[],
     education[], status: 'pending'|'approved'|'rejected',
     connections[], followers[], following[],
     createdAt, updatedAt
   }
   ```

2. **Post Model**
   ```javascript
   {
     author, content, images[], type, likes[], comments[],
     shares, visibility, createdAt, updatedAt
   }
   ```

3. **Article Model**
   ```javascript
   {
     author, title, content, coverImage, tags[],
     status: 'draft'|'published', views, likes[],
     comments[], createdAt, publishedAt
   }
   ```

4. **Connection Model**
   ```javascript
   {
     requester, recipient, status: 'pending'|'accepted'|'rejected',
     createdAt, updatedAt
   }
   ```

#### New API Routes
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/users/:id` - Get user profile
- `/api/users/:id/update` - Update profile
- `/api/posts` - CRUD operations for posts
- `/api/articles` - CRUD operations for articles
- `/api/connections` - Manage connections
- `/api/admin/users/pending` - Get pending users
- `/api/admin/users/:id/approve` - Approve user
- `/api/admin/users/:id/reject` - Reject user

### Frontend (React)

#### New Components
1. **Authentication**
   - RegisterForm
   - LoginForm
   - UserProtectedRoute

2. **User Profile**
   - ProfileHeader
   - ProfileAbout
   - ProfileExperience
   - ProfileEducation
   - ProfileSkills
   - ProfileActivity

3. **Home Feed**
   - FeedContainer
   - CreatePost
   - PostCard
   - PostInteractions
   - TrendingSidebar

4. **Articles**
   - ArticleEditor
   - ArticleCard
   - ArticleDetail
   - ArticleComments

5. **Admin Dashboard**
   - UserManagement (in General tab)
   - PendingUsersList
   - UserApprovalCard

#### New Pages/Routes
- `/register` - User registration
- `/login` - User login
- `/feed` - Home feed (logged-in users)
- `/profile/:userId` - User profile
- `/profile/edit` - Edit own profile
- `/articles` - Articles feed
- `/articles/:id` - Article detail
- `/articles/create` - Create article
- `/connections` - Connections list
- `/search` - Search page

## Implementation Phases

### Phase 1: User Registration & Approval (Priority)
1. Create User model and authentication
2. Build registration form
3. Add user management to admin dashboard
4. Implement approval workflow
5. Add email notifications

### Phase 2: User Profiles
1. Create profile page layout
2. Implement profile sections
3. Add profile editing
4. Profile picture/cover photo upload

### Phase 3: Home Feed & Posts
1. Create post model and API
2. Build feed interface
3. Implement post creation
4. Add post interactions (like, comment)

### Phase 4: Articles System
1. Create article model and API
2. Build article editor
3. Implement article display
4. Add comments system

### Phase 5: Networking Features
1. Implement connections system
2. Add connection suggestions
3. Build search functionality
4. Add discovery features

### Phase 6: Polish & Enhancement
1. Notifications system
2. Real-time updates
3. Performance optimization
4. Mobile responsiveness
5. Analytics dashboard

## Database Schema Updates

### Collections
- `users` - User profiles and authentication
- `posts` - User posts and updates
- `articles` - Long-form content
- `connections` - User relationships
- `comments` - Comments on posts/articles
- `notifications` - User notifications
- `admins` - Admin accounts (existing)
- `events` - Events (existing)

## Security Considerations
- Password hashing (bcrypt)
- JWT token management
- Input validation and sanitization
- Rate limiting on API endpoints
- File upload validation
- CORS configuration
- XSS protection
- CSRF protection

## Next Steps
1. Start with Phase 1: User Registration & Approval
2. Set up new database models
3. Create authentication system
4. Build registration UI
5. Implement admin approval workflow
