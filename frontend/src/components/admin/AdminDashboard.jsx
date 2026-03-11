import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, LogOut, Search, Filter, 
  Calendar, Users, MapPin, Clock, Eye, X,
  ChevronDown, ChevronUp, Image as ImageIcon,
  LayoutDashboard, Settings, Menu, UserCircle
} from 'lucide-react';
import { eventsAPI, adminAPI } from '../../services/api';
import { useAuth, useLogout } from '../../contexts/AuthContext';
import EventForm from './EventForm';
import UserManagement from './UserManagement';
import ProfilesManagement from './ProfilesManagement';
import './admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTab, setActiveTab] = useState('event-management');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(event => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (event.name && event.name.toLowerCase().includes(searchLower)) ||
          (event.header && event.header.toLowerCase().includes(searchLower)) ||
          (event.theme && event.theme.toLowerCase().includes(searchLower)) ||
          (event.description && event.description.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await adminAPI.deleteEvent(eventId);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (eventData) => {
    try {
      if (editingEvent) {
        await adminAPI.updateEvent(editingEvent._id, eventData);
      } else {
        await adminAPI.createEvent(eventData);
      }
      setShowForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handlePreviewEvent = (event) => {
    setSelectedEvent(event);
    setShowPreview(true);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const toggleCardExpansion = (eventId) => {
    setExpandedCard(expandedCard === eventId ? null : eventId);
  };

  const getEventStats = () => {
    return {
      total: events.length,
      upcoming: events.filter(e => e.type === 'upcoming').length,
      past: events.filter(e => e.type === 'past').length
    };
  };

  const stats = getEventStats();

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'event-management':
        return renderEventManagementTab();
      case 'profiles':
        return renderProfilesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderEventManagementTab();
    }
  };

  const renderGeneralTab = () => (
    <div className="tab-content">
      <h2 className="tab-title">Dashboard Overview</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card stat-upcoming">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Upcoming</span>
            <span className="stat-value">{stats.upcoming}</span>
          </div>
        </div>
        <div className="stat-card stat-past">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Past Events</span>
            <span className="stat-value">{stats.past}</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Events</h3>
        <div className="activity-list">
          {events.slice(0, 5).map(event => (
            <div key={event._id} className="activity-item">
              <div className="activity-icon">
                <Calendar size={16} />
              </div>
              <div className="activity-details">
                <p className="activity-title">{event.name || event.header}</p>
                <p className="activity-meta">{event.type} • {new Date(event.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Management Section */}
      <div className="section-divider"></div>
      <UserManagement />
    </div>
  );

  const renderEventManagementTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">Event Management</h2>
        <button onClick={handleCreateEvent} className="create-btn">
          <Plus size={18} />
          <span>Create Event</span>
        </button>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No events found</h3>
          <p>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first event to get started'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button onClick={handleCreateEvent} className="create-btn">
              <Plus size={18} />
              <span>Create Event</span>
            </button>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event._id} className={`event-card ${event.type} ${expandedCard === event._id ? 'expanded' : ''}`}>
              <div className="event-card-header">
                <div className="event-type-badge">
                  {event.type === 'upcoming' ? (
                    <>
                      <Clock size={14} />
                      <span>Upcoming</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={14} />
                      <span>Past</span>
                    </>
                  )}
                </div>
                <div className="event-actions">
                  <button onClick={() => handlePreviewEvent(event)} className="action-btn preview-btn" title="Preview">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleEditEvent(event)} className="action-btn edit-btn" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteEvent(event._id)} className="action-btn delete-btn" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {event.coverImage && (
                <div className="event-card-image">
                  <img 
                    src={`http://localhost:5000${event.coverImage}`} 
                    alt={event.name || event.header}
                    onError={(e) => {
                      console.error('Image failed to load:', event.coverImage);
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="event-card-body">
                <h3 className="event-title">{event.name || event.header}</h3>
                
                {event.type === 'upcoming' ? (
                  <div className="event-details">
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>{event.date}</span>
                    </div>
                    {event.time && (
                      <div className="detail-item">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="event-description">
                      {event.description?.substring(0, 100)}
                      {event.description?.length > 100 && '...'}
                    </div>
                  </div>
                ) : (
                  <div className="event-details">
                    {event.theme && <div className="event-theme">{event.theme}</div>}
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                    {event.participants && (
                      <div className="detail-item">
                        <Users size={14} />
                        <span>{event.participants} participants</span>
                      </div>
                    )}
                    <div className="event-teaser">{event.teaser}</div>
                  </div>
                )}

                {event.gallery && event.gallery.length > 0 && (
                  <div className="event-image-count">
                    <ImageIcon size={14} />
                    <span>{event.gallery.length} image{event.gallery.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              <button className="expand-btn" onClick={() => toggleCardExpansion(event._id)}>
                {expandedCard === event._id ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span>Show more</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>

              {expandedCard === event._id && (
                <div className="event-card-expanded">
                  {event.type === 'past' && event.fullDescription && (
                    <div className="expanded-section">
                      <h4>Full Description</h4>
                      <p>{event.fullDescription}</p>
                    </div>
                  )}
                  {event.facilitator && (
                    <div className="expanded-section">
                      <h4>Facilitator</h4>
                      <p>{event.facilitator}</p>
                    </div>
                  )}
                  {event.duration && (
                    <div className="expanded-section">
                      <h4>Duration</h4>
                      <p>{event.duration}</p>
                    </div>
                  )}
                  {event.gallery && event.gallery.length > 0 && (
                    <div className="expanded-section">
                      <h4>Gallery ({event.gallery.length} images)</h4>
                      <div className="gallery-preview">
                        {event.gallery.map((img, idx) => (
                          <div key={idx} className="gallery-thumb">
                            <img 
                              src={`http://localhost:5000${img}`} 
                              alt={`Gallery ${idx + 1}`}
                              onError={(e) => {
                                console.error('Gallery image failed:', img);
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfilesTab = () => (
    <div className="tab-content">
      <ProfilesManagement />
    </div>
  );

  const renderSettingsTab = () => (
    <div className="tab-content">
      <h2 className="tab-title">Settings</h2>
      <div className="settings-section">
        <div className="settings-card">
          <h3>Account Information</h3>
          <div className="settings-item">
            <label>Username</label>
            <p>{user?.username || 'admin'}</p>
          </div>
          <div className="settings-item">
            <label>Email</label>
            <p>{user?.email || 'admin@sewingcircle.com'}</p>
          </div>
          <div className="settings-item">
            <label>Role</label>
            <p>Administrator</p>
          </div>
        </div>

        <div className="settings-card">
          <h3>Application Settings</h3>
          <div className="settings-item">
            <label>Theme</label>
            <p>Light Mode</p>
          </div>
          <div className="settings-item">
            <label>Language</label>
            <p>English</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && activeTab === 'event-management') {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Sewing Circle</h1>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <LayoutDashboard size={20} />
            <span>General</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'event-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('event-management')}
          >
            <Calendar size={20} />
            <span>Event Management</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'profiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            <UserCircle size={20} />
            <span>Profiles</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.username || 'Admin'}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Event Preview</h2>
              <button onClick={() => setShowPreview(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="preview-content">
              {selectedEvent.coverImage && (
                <img 
                  src={`http://localhost:5000${selectedEvent.coverImage}`} 
                  alt={selectedEvent.name || selectedEvent.header}
                  className="preview-image"
                  onError={(e) => {
                    console.error('Preview image failed:', selectedEvent.coverImage);
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <h3>{selectedEvent.name || selectedEvent.header}</h3>
              {selectedEvent.theme && <p className="preview-theme">{selectedEvent.theme}</p>}
              {selectedEvent.type === 'upcoming' ? (
                <>
                  <div className="preview-details">
                    <div><strong>Date:</strong> {selectedEvent.date}</div>
                    {selectedEvent.time && <div><strong>Time:</strong> {selectedEvent.time}</div>}
                    {selectedEvent.venue && (
                      <div>
                        <strong>Venue:</strong>{' '}
                        <a href={selectedEvent.venue} target="_blank" rel="noopener noreferrer">
                          View Location
                        </a>
                      </div>
                    )}
                  </div>
                  <p className="preview-description">{selectedEvent.description}</p>
                </>
              ) : (
                <>
                  <div className="preview-details">
                    <div><strong>Location:</strong> {selectedEvent.location}</div>
                    {selectedEvent.duration && <div><strong>Duration:</strong> {selectedEvent.duration}</div>}
                    {selectedEvent.participants && <div><strong>Participants:</strong> {selectedEvent.participants}</div>}
                    {selectedEvent.facilitator && <div><strong>Facilitator:</strong> {selectedEvent.facilitator}</div>}
                  </div>
                  <p className="preview-teaser">{selectedEvent.teaser}</p>
                  {selectedEvent.fullDescription && (
                    <p className="preview-full-description">{selectedEvent.fullDescription}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
