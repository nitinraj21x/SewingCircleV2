import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Users, Bell, MessageCircle, Search, 
  TrendingUp, Calendar, User, LogOut, MapPin, Clock
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

  useEffect(() => {
    fetchUserData();
    fetchFeed();
    fetchSuggestions();
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchFeed();
    }
  }, [page]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchFeed = async () => {
    try {
      const response = await postsAPI.getFeed(page, 10);

      if (page === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }

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
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await eventsAPI.getUpcomingEvents();
      setUpcomingEvents(response.data.slice(0, 3)); // Show only 3 events
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      await eventsAPI.registerForEvent(eventId);
      
      // Update the event in the list
      setUpcomingEvents(upcomingEvents.map(event => {
        if (event._id === eventId) {
          return {
            ...event,
            registrations: [...(event.registrations || []), { user: user._id }]
          };
        }
        return event;
      }));

      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      await eventsAPI.unregisterFromEvent(eventId);
      
      // Update the event in the list
      setUpcomingEvents(upcomingEvents.map(event => {
        if (event._id === eventId) {
          return {
            ...event,
            registrations: (event.registrations || []).filter(reg => reg.user !== user._id)
          };
        }
        return event;
      }));

      alert('Successfully unregistered from the event');
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert(error.response?.data?.message || 'Failed to unregister from event');
    }
  };

  const isRegistered = (event) => {
    if (!user || !event.registrations) return false;
    return event.registrations.some(reg => reg.user === user._id);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handleFollow = async (userId) => {
    try {
      await followAPI.followUser(userId);
      // Remove from suggestions
      setSuggestions(suggestions.filter(s => s._id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
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
            <button className="nav-icon-btn active" title="Home">
              <Home size={20} />
              <span>Home</span>
            </button>
            <button className="nav-icon-btn" title="Network">
              <Users size={20} />
              <span>Network</span>
            </button>
            <button className="nav-icon-btn" title="Notifications">
              <Bell size={20} />
              <span>Notifications</span>
            </button>
            <button className="nav-icon-btn" title="Messages">
              <MessageCircle size={20} />
              <span>Messages</span>
            </button>
            <button 
              className="nav-icon-btn" 
              title="Profile"
              onClick={() => navigate(`/profile/${user?._id}`)}
            >
              <User size={20} />
              <span>Me</span>
            </button>
            <button 
              className="nav-icon-btn logout-btn" 
              title="Logout"
              onClick={handleLogout}
            >
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
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const icon = document.createElement('div');
                    icon.className = 'profile-card-avatar';
                    icon.style.display = 'flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.background = '#e2e8f0';
                    icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    e.target.parentNode.insertBefore(icon, e.target);
                  }}
                />
              ) : (
                <div className="profile-card-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                  <User size={32} color="#64748b" />
                </div>
              )}
              <h3 className="profile-card-name">{user.firstName} {user.lastName}</h3>
              <p className="profile-card-headline">{user.headline || 'Member'}</p>
              <button 
                className="view-profile-btn"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                View Profile
              </button>
            </div>
          )}

          <div className="quick-links-card">
            <h4>Quick Links</h4>
            <button className="quick-link">
              <Calendar size={16} />
              <span>Events</span>
            </button>
            <button className="quick-link">
              <TrendingUp size={16} />
              <span>Trending</span>
            </button>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="feed-main">
          <CreatePost user={user} onPostCreated={handlePostCreated} />

          <div className="posts-container">
            {posts.length === 0 ? (
              <div className="empty-feed">
                <Home size={48} />
                <h3>No posts yet</h3>
                <p>Start following people or create your first post!</p>
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
                  <button className="load-more-btn" onClick={loadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="feed-sidebar-right">
          {/* Upcoming Events */}
          <div className="events-card">
            <h4>
              <Calendar size={18} />
              Upcoming Events
            </h4>
            {upcomingEvents.length === 0 ? (
              <p className="no-events">No upcoming events</p>
            ) : (
              <div className="events-list">
                {upcomingEvents.map(event => (
                  <div key={event._id} className="event-item">
                    <div className="event-info">
                      <h5>{event.name}</h5>
                      <div className="event-details">
                        {event.date && (
                          <span className="event-detail">
                            <Calendar size={12} />
                            {event.date}
                          </span>
                        )}
                        {event.time && (
                          <span className="event-detail">
                            <Clock size={12} />
                            {event.time}
                          </span>
                        )}
                        {event.venue && (
                          <span className="event-detail">
                            <MapPin size={12} />
                            {event.venue}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="event-description">
                          {event.description.substring(0, 80)}
                          {event.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                      <div className="event-stats">
                        <span>{event.registrations?.length || 0} registered</span>
                        {event.maxParticipants && (
                          <span>/ {event.maxParticipants} max</span>
                        )}
                      </div>
                    </div>
                    {isRegistered(event) ? (
                      <button
                        className="event-btn registered"
                        onClick={() => handleUnregisterEvent(event._id)}
                      >
                        Registered ✓
                      </button>
                    ) : (
                      <button
                        className="event-btn"
                        onClick={() => handleRegisterEvent(event._id)}
                        disabled={event.maxParticipants && event.registrations?.length >= event.maxParticipants}
                      >
                        {event.maxParticipants && event.registrations?.length >= event.maxParticipants
                          ? 'Full'
                          : 'Register'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* People to Follow */}
          <div className="suggestions-card">
            <h4>People to Follow</h4>
            {suggestions.length === 0 ? (
              <p className="no-suggestions">No suggestions available</p>
            ) : (
              <div className="suggestions-list">
                {suggestions.map(suggestion => (
                  <div key={suggestion._id} className="suggestion-item">
                    {suggestion.profilePicture ? (
                      <img 
                        src={getImageUrl(suggestion.profilePicture)}
                        alt={`${suggestion.firstName} ${suggestion.lastName}`}
                        className="suggestion-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const icon = document.createElement('div');
                          icon.className = 'suggestion-avatar';
                          icon.style.display = 'flex';
                          icon.style.alignItems = 'center';
                          icon.style.justifyContent = 'center';
                          icon.style.background = '#e2e8f0';
                          icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                          e.target.parentNode.insertBefore(icon, e.target);
                        }}
                      />
                    ) : (
                      <div className="suggestion-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                        <User size={24} color="#64748b" />
                      </div>
                    )}
                    <div className="suggestion-info">
                      <h5>{suggestion.firstName} {suggestion.lastName}</h5>
                      <p>{suggestion.headline || 'Member'}</p>
                    </div>
                    <button 
                      className="follow-btn"
                      onClick={() => handleFollow(suggestion._id)}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
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

export default FeedPage;
