# Localhost URL Fixes Needed

## Summary
The following files still contain hardcoded `localhost:5000` URLs that need to be replaced with the API service.

## Files Fixed ✅
- ✅ api.js - Added getImageUrl helper and all API endpoints
- ✅ UserManagement.jsx - Using adminAPI
- ✅ UserPostsModal.jsx - Using adminAPI and getImageUrl
- ✅ ProfilesManagement.jsx - Using adminAPI and getImageUrl
- ✅ ProfilePage.jsx - Using authAPI and profileAPI

## Files Still Need Fixing ❌

### Profile Components
1. **ProfileHeader.jsx** - 5 instances
   - Upload cover photo
   - Upload profile picture
   - Get current user
   - Image URLs (2x)

2. **ProfileSkills.jsx** - 1 instance
   - Update skills

3. **ProfileExperience.jsx** - 2 instances
   - Add/update experience
   - Delete experience

4. **ProfileEducation.jsx** - 2 instances
   - Add/update education
   - Delete education

### Feed Components
5. **FeedPage.jsx** - 6 instances
   - Get current user
   - Get feed
   - Get follow suggestions
   - Get upcoming events
   - Register for event
   - Unregister from event
   - Follow user
   - Image URLs (2x)

6. **PostCard.jsx** - 6 instances
   - Like post
   - Comment on post
   - Delete post
   - Image URLs (3x)

7. **AdminDashboard.jsx** - 3 instances
   - Image URLs (3x)

8. **EventsSection.jsx** - Multiple instances
   - Image URLs in background styles

## Recommended Approach

1. Import the API services and getImageUrl helper
2. Replace axios calls with API service methods
3. Replace image URL constructions with getImageUrl()
4. Remove axios import if no longer needed
5. Test each component after fixing

## API Service Methods Available

### authAPI
- getCurrentUser()

### profileAPI
- getProfile(userId)
- updateSkills(skills)
- addExperience(data)
- updateExperience(id, data)
- deleteExperience(id)
- addEducation(data)
- updateEducation(id, data)
- deleteEducation(id)

### uploadAPI
- uploadCoverPhoto(formData)
- uploadProfilePicture(formData)

### postsAPI
- getFeed(page, limit)
- likePost(postId)
- commentOnPost(postId, content)
- deletePost(postId)

### followAPI
- getSuggestions()
- followUser(userId)

### eventsAPI
- getUpcomingEvents()
- registerForEvent(eventId)
- unregisterFromEvent(eventId)

### getImageUrl(path)
- Helper function to construct full image URLs
