import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Users, Bell, MessageCircle, Search,
  TrendingUp, Calendar, User, LogOut, MapPin, Clock,
  Briefcase, FolderOpen
} from 'lucide-react';
import { authAPI, postsAPI, followAPI, eventsAPI, getImageUrl } from '../../services/api';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import './feed.css';

const FeedPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    fetchUserData();
    fetchFeed();
    fetchSuggestions();
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    if (page > 1) fetchFeed();
  }, [page]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    }
  };

  const fetchFeed = async () => {
    try {
      const response = await postsAPI.getFeed(page, 10);
      if (page === 1) setPosts(response.data.posts);
      else setPosts(prev => [...prev, ...response.data.posts]);
      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await followAPI.getSuggestions();
      setSuggestions(response.data.suggestions.slice(0, 5));
    } catch (error) { /* silent */ }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await eventsAPI.getUpcomingEvents();
      setUpcomingEvents(response.data.slice(0, 3));
    } catch (error) { /* silent */ }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await eventsAPI.registerForEvent(eventId);
      setUpcomingEvents(upcomingEvents.map(event =>
        event._id === eventId
          ? { ...event, registrations: [...(event.registrations || []), { user: user._id }] }
          : event
      ));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      await eventsAPI.unregisterFromEvent(eventId);
      setUpcomingEvents(upcomingEvents.map(event =>
        event._id === eventId
          ? { ...event, registrations: (event.registrations || []).filter(reg => reg.user !== user._id) }
          : event
      ));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unregister');
    }
  };

  const isRegistered = (event) => {
    if (!user || !event.registrations) return false;
    return event.registrations.some(reg => reg.user === user._id || reg.user?._id === user._id);
  };

  const handlePostCreated = (newPost) => setPosts([newPost, ...posts]);
  const handlePostUpdated = (updatedPost) => setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  const handlePostDeleted = (postId) => setPosts(posts.filter(p => p._id !== postId));

  const handleFollow = async (userId) => {
    try {
      await followAPI.followUser(userId);
      setSuggestions(suggestions.filter(s => s._id !== userId));
    } catch (error) { /* silent */ }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading && page === 1) {
    return (
      <div className="feed-page">
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      {/* Navigation Bar */}
      <nav className="feed-nav">
        <div className="feed-nav-content">
          <div className="feed-nav-left">
            <h1 className="feed-logo">Sewing Circle</h1>
          </div>

          <div className="feed-nav-center">
            <div className="feed-search">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>

          <div className="feed-nav-right">
            <button
              className={`nav-icon-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
              title="Home"
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'circle' ? 'active' : ''}`}
              onClick={() => setActiveTab('circle')}
              title="Circle"
            >
              <Users size={20} />
              <span>Circle</span>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
              title="Events"
            >
              <Calendar size={20} />
              <span>Events</span>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => navigate('/projects')}
              title="Projects"
            >
              <FolderOpen size={20} />
              <span>Projects</span>
            </button>
            <button
              className={`nav-icon-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
              title="Notifications"
            >
              <Bell size={20} />
              <span>Notifications</span>
            </button>
            <button
              className="nav-icon-btn"
              title="Profile"
              onClick={() => navigate(`/profile/${user?._id}`)}
            >
              <User size={20} />
              <span>Me</span>
            </button>
            <button className="nav-icon-btn logout-btn" title="Logout" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="feed-container">
        {/* Left Sidebar */}
        <aside className="feed-sidebar-left">
          {user && (
            <div className="profile-card-mini">
              <div className="profile-card-cover"></div>
              {user.profilePicture ? (
                <img
                  src={getImageUrl(user.profilePicture)}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="profile-card-avatar"
                />
              ) : (
                <div className="profile-card-avatar profile-card-avatar-placeholder">
                  <User size={32} color="#64748b" />
                </div>
              )}
              <h3 className="profile-card-name">{user.firstName} {user.lastName}</h3>
              <p className="profile-card-headline">{user.headline || 'Member'}</p>
              <button className="view-profile-btn" onClick={() => navigate(`/profile/${user._id}`)}>
                View Profile
              </button>
            </div>
          )}

          <div className="quick-links-card">
            <h4>Quick Links</h4>
            <button className="quick-link" onClick={() => setActiveTab('events')}>
              <Calendar size={16} />
              <span>Events</span>
            </button>
            <button className="quick-link" onClick={() => navigate('/projects')}>
              <FolderOpen size={16} />
              <span>Projects</span>
            </button>
            <button className="quick-link" onClick={() => setActiveTab('circle')}>
              <Users size={16} />
              <span>My Circle</span>
            </button>
            <button className="quick-link">
              <TrendingUp size={16} />
              <span>Trending</span>
            </button>
          </div>
        </aside>

        {/* Main Feed Area */}
        <main className="feed-main">
          {activeTab === 'home' && (
            <>
              <CreatePost user={user} onPostCreated={handlePostCreated} />
              <div className="posts-container">
                {posts.length === 0 ? (
                  <div className="empty-feed">
                    <Home size={48} />
                    <h3>No posts yet</h3>
                    <p>Follow people to see their posts here, or create your first post!</p>
                  </div>
                ) : (
                  <>
                    {posts.map(post => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUser={user}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                      />
                    ))}
                    {hasMore && (
                      <button className="load-more-btn" onClick={() => setPage(p => p + 1)} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'circle' && (
            <CircleTab suggestions={suggestions} onFollow={handleFollow} navigate={navigate} />
          )}

          {activeTab === 'events' && (
            <EventsTab
              upcomingEvents={upcomingEvents}
              user={user}
              isRegistered={isRegistered}
              onRegister={handleRegisterEvent}
              onUnregister={handleUnregisterEvent}
            />
          )}

          {activeTab === 'notifications' && (
            <div className="tab-placeholder">
              <Bell size={48} />
              <h3>Notifications</h3>
              <p>Coming soon</p>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="feed-sidebar-right">
          <div className="events-card">
            <h4><Calendar size={18} /> Upcoming Events</h4>
            {upcomingEvents.length === 0 ? (
              <p className="no-events">No upcoming events</p>
            ) : (
              <div className="events-list">
                {upcomingEvents.map(event => (
                  <div key={event._id} className="event-item">
                    <div className="event-info">
                      <h5 className="event-name">{event.name}</h5>
                      <div className="event-details">
                        {event.date && <span className="event-detail"><Calendar size={12} />{event.date}</span>}
                        {event.time && <span className="event-detail"><Clock size={12} />{event.time}</span>}
                      </div>
                      <div className="event-stats">{event.registrations?.length || 0} registered</div>
                    </div>
                    {isRegistered(event) ? (
                      <button className="event-btn registered" onClick={() => handleUnregisterEvent(event._id)}>
                        Registered ✓
                      </button>
                    ) : (
                      <button className="event-btn" onClick={() => handleRegisterEvent(event._id)}>
                        Register
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="suggestions-card">
            <h4>People to Follow</h4>
            {suggestions.length === 0 ? (
              <p className="no-suggestions">No suggestions available</p>
            ) : (
              <div className="suggestions-list">
                {suggestions.map(suggestion => (
                  <div key={suggestion._id} className="suggestion-item">
                    {suggestion.profilePicture ? (
                      <img src={getImageUrl(suggestion.profilePicture)} alt="" className="suggestion-avatar" />
                    ) : (
                      <div className="suggestion-avatar suggestion-avatar-placeholder">
                        <User size={20} color="#64748b" />
                      </div>
                    )}
                    <div className="suggestion-info">
                      <h5>{suggestion.firstName} {suggestion.lastName}</h5>
                      <p>{suggestion.headline || 'Member'}</p>
                    </div>
                    <button className="follow-btn" onClick={() => handleFollow(suggestion._id)}>Follow</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="footer-card">
            <p>&copy; 2026 Sewing Circle</p>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Circle Tab - renamed from Network
const CircleTab = ({ suggestions, onFollow, navigate }) => (
  <div className="circle-tab">
    <div className="tab-header">
      <h2>My Circle</h2>
      <p>People you're connected with and new members to meet</p>
    </div>
    {suggestions.length === 0 ? (
      <div className="tab-placeholder">
        <Users size={48} />
        <h3>Your circle is growing</h3>
        <p>No new suggestions right now</p>
      </div>
    ) : (
      <div className="circle-grid">
        {suggestions.map(user => (
          <div key={user._id} className="circle-card">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="" className="circle-avatar" />
            ) : (
              <div className="circle-avatar circle-avatar-placeholder">
                <User size={32} color="#64748b" />
              </div>
            )}
            <h4>{user.firstName} {user.lastName}</h4>
            <p>{user.headline || 'Member'}</p>
            <div className="circle-card-actions">
              <button className="follow-btn" onClick={() => onFollow(user._id)}>Follow</button>
              <button className="view-btn" onClick={() => navigate(`/profile/${user._id}`)}>View</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Events Tab
const EventsTab = ({ upcomingEvents, user, isRegistered, onRegister, onUnregister }) => (
  <div className="events-tab">
    <div className="tab-header">
      <h2>Events</h2>
      <p>Upcoming Sewing Circle gatherings</p>
    </div>
    {upcomingEvents.length === 0 ? (
      <div className="tab-placeholder">
        <Calendar size={48} />
        <h3>No upcoming events</h3>
        <p>Check back soon for new events!</p>
      </div>
    ) : (
      <div className="events-tab-list">
        {upcomingEvents.map(event => (
          <div key={event._id} className="events-tab-card">
            <div className="events-tab-card-header">
              <h3>{event.name}</h3>
              <span className="event-badge">Upcoming</span>
            </div>
            <div className="events-tab-meta">
              {event.date && <span><Calendar size={14} /> {event.date}</span>}
              {event.time && <span><Clock size={14} /> {event.time}</span>}
              {event.venue && <span><MapPin size={14} /> <a href={event.venue} target="_blank" rel="noopener noreferrer">View Location</a></span>}
            </div>
            {event.description && (
              <p className="events-tab-desc">{event.description}</p>
            )}
            <div className="events-tab-footer">
              <span className="event-reg-count">{event.registrations?.length || 0} registered</span>
              {isRegistered(event) ? (
                <button className="event-btn registered" onClick={() => onUnregister(event._id)}>
                  Registered ✓
                </button>
              ) : (
                <button className="event-btn" onClick={() => onRegister(event._id)}>
                  Register Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default FeedPage;
