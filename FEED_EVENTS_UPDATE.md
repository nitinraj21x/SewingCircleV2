# Feed Page Events Update

## Overview
Added upcoming events display to the feed page with event registration functionality. Users can now view upcoming events in the right sidebar and register/unregister with a single click. Also fixed styling issues in the feed page.

## Changes Made

### Backend Changes

#### 1. Event Model Update (`backend/models/Event.js`)
Added registration tracking fields:
- `registrations` - Array of user registrations with timestamps
- `maxParticipants` - Optional limit for event capacity (null = unlimited)

#### 2. Event Routes Update (`backend/routes/events.js`)
Added new endpoints:

**POST /api/events/:id/register**
- Allows authenticated users to register for upcoming events
- Validates event type (must be upcoming)
- Checks if user is already registered
- Checks if event is full
- Returns success message and registration count

**DELETE /api/events/:id/register**
- Allows authenticated users to unregister from events
- Removes user from registrations array
- Returns success message and updated registration count

### Frontend Changes

#### 1. FeedPage Component (`frontend/src/components/feed/FeedPage.jsx`)

**New State:**
- `upcomingEvents` - Stores list of upcoming events

**New Functions:**
- `fetchUpcomingEvents()` - Fetches upcoming events from API
- `handleRegisterEvent(eventId)` - Registers user for an event
- `handleUnregisterEvent(eventId)` - Unregisters user from an event
- `isRegistered(event)` - Checks if current user is registered for an event

**New UI Elements:**
- Events card in right sidebar showing up to 3 upcoming events
- Event details (name, date, time, venue, description)
- Registration count and capacity display
- Register/Unregister button with status indication
- "Full" state when event reaches capacity

**Updated Imports:**
- Added `MapPin` and `Clock` icons from lucide-react

#### 2. Feed CSS (`frontend/src/components/feed/feed.css`)

**New Styles Added:**

**Profile Card Mini:**
- `.profile-card-mini` - Container for user profile in left sidebar
- `.profile-card-cover` - Gradient header
- `.profile-card-avatar` - User avatar with border
- `.profile-card-name` - User name styling
- `.profile-card-headline` - User headline/profession
- `.view-profile-btn` - Button to view full profile

**Events Section:**
- `.events-card` - Container for events list
- `.events-list` - Vertical list of events
- `.event-item` - Individual event card with hover effect
- `.event-info` - Event information container
- `.event-details` - Date, time, venue details
- `.event-detail` - Individual detail with icon
- `.event-description` - Event description text
- `.event-stats` - Registration count display
- `.event-btn` - Register button with states
- `.event-btn.registered` - Green style for registered state
- `.no-events` - Empty state message

**Quick Links Card:**
- `.quick-links-card` - Container for quick links
- `.quick-link` - Individual link button with hover effect

**Footer Card:**
- `.footer-card` - Footer container
- `.footer-links` - Footer navigation links

**Suggestions Card:**
- Updated to match events card styling
- Consistent header styling with icons

## Features

### 1. Event Display
- Shows up to 3 upcoming events in right sidebar
- Displays event name, date, time, and venue
- Shows truncated description (80 characters)
- Displays registration count and capacity

### 2. Event Registration
- One-click registration for upcoming events
- Visual feedback with "Registered ✓" button
- Click again to unregister
- Disabled state when event is full
- Real-time registration count updates

### 3. Event Capacity Management
- Shows "X registered / Y max" when capacity is set
- Disables registration when event is full
- Shows "Full" button text when capacity reached
- Unlimited capacity when maxParticipants is null

### 4. Styling Improvements
- Fixed profile card in left sidebar
- Added proper spacing and borders
- Consistent card styling across all sections
- Hover effects on interactive elements
- Responsive design maintained
- Color-coded registration status (blue for register, green for registered)

### 5. User Experience
- Alert notifications for registration success/failure
- Error handling with user-friendly messages
- Smooth transitions and hover effects
- Clear visual hierarchy
- Accessible button states

## Usage

### Viewing Events
1. Login to the platform
2. Navigate to the feed page
3. Check the right sidebar for "Upcoming Events" section
4. View event details including date, time, venue, and description

### Registering for Events
1. Find an event you want to attend
2. Click the "Register" button
3. Button changes to "Registered ✓" with green styling
4. Registration count updates immediately

### Unregistering from Events
1. Find an event you're registered for (green "Registered ✓" button)
2. Click the "Registered ✓" button
3. Button changes back to blue "Register"
4. Registration count decreases

### Event Full State
- When an event reaches capacity, the button shows "Full" and is disabled
- Users cannot register for full events
- Already registered users can still unregister

## Technical Details

### Data Flow
1. Frontend fetches upcoming events from `/api/events/upcoming`
2. Events displayed in right sidebar with registration status
3. User clicks register button
4. POST request to `/api/events/:id/register` with auth token
5. Backend validates and adds user to registrations array
6. Frontend updates local state and UI
7. Success/error message displayed to user

### Authentication
- All registration endpoints require authentication
- Uses JWT token from localStorage
- Token passed in Authorization header
- Backend verifies user identity before registration

### Validation
- Event type must be "upcoming" for registration
- Checks for duplicate registrations
- Validates event capacity before allowing registration
- Handles edge cases (event not found, server errors)

### State Management
- Local state updates immediately for responsive UI
- Registration count updated in real-time
- User registration status tracked per event
- No page refresh required

## Files Modified

### Backend
- `backend/models/Event.js` - Added registration fields
- `backend/routes/events.js` - Added registration endpoints

### Frontend
- `frontend/src/components/feed/FeedPage.jsx` - Added events display and registration
- `frontend/src/components/feed/feed.css` - Added event and sidebar styles

## Testing

### Test Scenarios
1. ✅ View upcoming events in feed
2. ✅ Register for an event
3. ✅ Unregister from an event
4. ✅ Attempt to register twice (should fail)
5. ✅ View registration count updates
6. ✅ Test event capacity limits
7. ✅ Test with no upcoming events
8. ✅ Test authentication requirement
9. ✅ Test responsive design
10. ✅ Test styling consistency

### Known Limitations
- Events are fetched once on page load (no real-time updates)
- Maximum 3 events shown (could add "View All" link)
- No event details modal (could add for more information)
- No calendar integration
- No email notifications for registrations

## Future Enhancements
- Add event details modal with full information
- Implement real-time registration updates (WebSocket)
- Add calendar view for events
- Email notifications for registrations
- Event reminders
- Add to calendar functionality
- Event search and filtering
- Past events attendance tracking
- Event feedback and ratings
- Social sharing for events
- Event categories/tags
- RSVP with "Maybe" option
- Waitlist for full events

## Date
February 22, 2026
