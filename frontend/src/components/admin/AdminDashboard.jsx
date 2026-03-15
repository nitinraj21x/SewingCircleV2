import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, LogOut, Search, Filter, 
  Calendar, Users, MapPin, Clock, X,
  LayoutDashboard, Settings, Menu, UserCircle,
  Image as ImageIcon, Upload
} from 'lucide-react';
import { eventsAPI, adminAPI, getImageUrl } from '../../services/api';
import { useAuth, useLogout } from '../../contexts/AuthContext';
import UserManagement from './UserManagement';
import ProfilesManagement from './ProfilesManagement';
import './admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('event-management');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Detail panel state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [enlargedImages, setEnlargedImages] = useState({});

  // Edit state (inline in detail panel)
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => { filterEvents(); }, [events, searchTerm, filterType]);

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
    if (filterType !== 'all') filtered = filtered.filter(e => e.type === filterType);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.name || '').toLowerCase().includes(s) ||
        (e.header || '').toLowerCase().includes(s) ||
        (e.location || '').toLowerCase().includes(s)
      );
    }
    setFilteredEvents(filtered);
  };

  const openDetail = async (event) => {
    setDetailLoading(true);
    setSelectedEvent(event);
    setEditMode(false);
    setEnlargedImages({});
    try {
      const res = await adminAPI.getEvent(event._id);
      setSelectedEvent(res.data);
    } catch {
      // fallback to list data
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedEvent(null);
    setEditMode(false);
    setEditData(null);
    setNewImages([]);
    setRemovedImages([]);
    setEnlargedImages({});
  };

  const startEdit = () => {
    setEditData({ ...selectedEvent });
    setNewImages([]);
    setRemovedImages([]);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditData(null);
    setNewImages([]);
    setRemovedImages([]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleRemoveImage = (img) => {
    setRemovedImages(prev => [...prev, img]);
    setEditData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter(g => g !== img)
    }));
  };

  const handleNewImages = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editData,
        gallery: editData.gallery || [],
        newImages: newImages.length > 0 ? newImages : null
      };
      const res = await adminAPI.updateEvent(selectedEvent._id, payload);
      setSelectedEvent(res.data);
      setEditMode(false);
      setEditData(null);
      setNewImages([]);
      setRemovedImages([]);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await adminAPI.deleteEvent(eventId);
      closeDetail();
      fetchEvents();
    } catch {
      alert('Failed to delete event.');
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (key === 'newImages' && eventData[key]) {
          Array.from(eventData[key]).forEach(f => formData.append('images', f));
        } else if (eventData[key] !== undefined && eventData[key] !== null) {
          formData.append(key, eventData[key]);
        }
      });
      await adminAPI.createEvent(eventData);
      setShowCreateForm(false);
      fetchEvents();
    } catch {
      alert('Failed to create event.');
    }
  };

  const toggleImageEnlarge = (key) => {
    setEnlargedImages(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getEventStats = () => ({
    total: events.length,
    upcoming: events.filter(e => e.type === 'upcoming').length,
    past: events.filter(e => e.type === 'past').length
  });

  const stats = getEventStats();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({ type: 'upcoming', name: '', date: '', time: '', venue: '', description: '', header: '', theme: '', teaser: '', fullDescription: '', location: '', duration: '', participants: '', facilitator: '' });
  const [createImages, setCreateImages] = useState([]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateData(prev => ({ ...prev, [name]: value }));
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...createData, newImages: createImages.length > 0 ? createImages : null };
      await adminAPI.createEvent(payload);
      setShowCreateForm(false);
      setCreateData({ type: 'upcoming', name: '', date: '', time: '', venue: '', description: '', header: '', theme: '', teaser: '', fullDescription: '', location: '', duration: '', participants: '', facilitator: '' });
      setCreateImages([]);
      fetchEvents();
    } catch {
      alert('Failed to create event.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'event-management': return renderEventManagementTab();
      case 'profiles': return <div className="tab-content"><ProfilesManagement /></div>;
      case 'settings': return renderSettingsTab();
      default: return renderEventManagementTab();
    }
  };

  const renderGeneralTab = () => (
    <div className="tab-content">
      <h2 className="tab-title">Dashboard Overview</h2>
      <div className="dashboard-stats">
        <div className="stat-card stat-total">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card stat-upcoming">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Upcoming</span>
            <span className="stat-value">{stats.upcoming}</span>
          </div>
        </div>
        <div className="stat-card stat-past">
          <div className="stat-icon"><Users size={24} /></div>
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
              <div className="activity-icon"><Calendar size={16} /></div>
              <div className="activity-details">
                <p className="activity-title">{event.name || event.header}</p>
                <p className="activity-meta">{event.type} • {new Date(event.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider"></div>
      <UserManagement />
    </div>
  );

  const renderEventManagementTab = () => (
    <div className="tab-content event-mgmt-layout">
      {/* Left: grid + controls */}
      <div className="event-mgmt-left">
        <div className="tab-header">
          <h2 className="tab-title">Event Management</h2>
          <button onClick={() => setShowCreateForm(true)} className="create-btn">
            <Plus size={18} /><span>Create Event</span>
          </button>
        </div>

        <div className="controls-section">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}><X size={16} /></button>}
          </div>
          <div className="filter-box">
            <Filter size={18} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
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
            <p>{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filters' : 'Create your first event to get started'}</p>
          </div>
        ) : (
          <div className="event-cards-grid">
            {filteredEvents.map(event => (
              <div
                key={event._id}
                className={`event-card-item ${selectedEvent?._id === event._id ? 'active' : ''} ${event.type}`}
                onClick={() => openDetail(event)}
              >
                <span className="ecard-date">
                  {event.date || (event.createdAt ? new Date(event.createdAt).toLocaleDateString() : '—')}
                </span>
                <span className="ecard-title">{event.name || event.header}</span>
                <div className="ecard-meta">
                  <span className="ecard-location">
                    <MapPin size={12} />
                    {event.location || event.venue || '—'}
                  </span>
                  <span className="ecard-participants">
                    <Users size={12} />
                    {event.registrations?.length ?? event.participants ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      <div className={`event-mgmt-right ${selectedEvent ? 'has-detail' : ''}`}>
        {!selectedEvent ? (
          <div className="detail-placeholder">
            <Calendar size={40} />
            <p>Select an event to view details</p>
          </div>
        ) : (
          <>
            <div className="detail-panel-header">
              <button className="back-btn" onClick={closeDetail} title="Close"><X size={16} /></button>
              <div className="detail-panel-actions">
                {!editMode && (
                  <>
                    <button className="action-btn edit-btn" onClick={startEdit} title="Edit"><Edit size={15} /></button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteEvent(selectedEvent._id)} title="Delete"><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </div>
            {detailLoading ? (
              <div className="loading-container"><div className="loading-spinner"></div></div>
            ) : editMode ? renderEditForm() : renderDetailView()}
          </>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="event-form-modal" onClick={e => e.stopPropagation()}>
            <div className="form-header">
              <h2>Create Event</h2>
              <button className="close-btn" onClick={() => setShowCreateForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={submitCreate} className="event-form">
              <div className="form-group">
                <label>Event Type</label>
                <select name="type" value={createData.type} onChange={handleCreateChange}>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              {renderFormFields(createData, handleCreateChange)}
              <div className="form-group">
                <label>Images</label>
                <input type="file" multiple accept="image/*" onChange={e => setCreateImages(Array.from(e.target.files))} />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFormFields = (data, onChange) => {
    if (data.type === 'upcoming') return (
      <>
        <div className="form-group"><label>Event Name</label><input name="name" value={data.name || ''} onChange={onChange} required /></div>
        <div className="form-group"><label>Date</label><input name="date" value={data.date || ''} onChange={onChange} required /></div>
        <div className="form-group"><label>Time</label><input name="time" value={data.time || ''} onChange={onChange} /></div>
        <div className="form-group"><label>Venue URL</label><input name="venue" value={data.venue || ''} onChange={onChange} /></div>
        <div className="form-group"><label>Description</label><textarea name="description" value={data.description || ''} onChange={onChange} rows="4" /></div>
      </>
    );
    return (
      <>
        <div className="form-group"><label>Header</label><input name="header" value={data.header || ''} onChange={onChange} required /></div>
        <div className="form-group"><label>Theme</label><input name="theme" value={data.theme || ''} onChange={onChange} /></div>
        <div className="form-group"><label>Teaser</label><textarea name="teaser" value={data.teaser || ''} onChange={onChange} rows="2" /></div>
        <div className="form-group"><label>Full Description</label><textarea name="fullDescription" value={data.fullDescription || ''} onChange={onChange} rows="4" /></div>
        <div className="form-group"><label>Location</label><input name="location" value={data.location || ''} onChange={onChange} /></div>
        <div className="form-group"><label>Duration</label><input name="duration" value={data.duration || ''} onChange={onChange} /></div>
        <div className="form-group"><label>Participants</label><input type="number" name="participants" value={data.participants || ''} onChange={onChange} /></div>
        <div className="form-group"><label>Facilitator</label><input name="facilitator" value={data.facilitator || ''} onChange={onChange} /></div>
      </>
    );
  };

  const renderDetailView = () => {
    const ev = selectedEvent;
    const gallery = ev.gallery || [];
    const registrations = ev.registrations || [];

    return (
      <div className="detail-body">
        <h2 className="detail-title">{ev.name || ev.header}</h2>
        <span className={`event-type-pill ${ev.type}`}>{ev.type}</span>

        <div className="detail-fields">
          {ev.date && <div className="detail-field"><Calendar size={14} /><span className="detail-date">{ev.date}</span></div>}
          {ev.time && <div className="detail-field"><Clock size={14} /><span>{ev.time}</span></div>}
          {(ev.location || ev.venue) && <div className="detail-field"><MapPin size={14} /><span>{ev.location || ev.venue}</span></div>}
          {ev.theme && <div className="detail-field"><span className="detail-theme">{ev.theme}</span></div>}
          {ev.duration && <div className="detail-field"><span>Duration: {ev.duration}</span></div>}
          {ev.facilitator && <div className="detail-field"><span>Facilitator: {ev.facilitator}</span></div>}
        </div>

        {(ev.description || ev.teaser) && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{ev.description || ev.teaser}</p>
          </div>
        )}
        {ev.fullDescription && (
          <div className="detail-section">
            <h4>Full Description</h4>
            <p>{ev.fullDescription}</p>
          </div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="detail-section">
            <h4>Images ({gallery.length})</h4>
            <div className="detail-gallery">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  className={`detail-thumb ${enlargedImages[idx] ? 'enlarged' : ''}`}
                  onClick={() => toggleImageEnlarge(idx)}
                >
                  <img src={getImageUrl(img)} alt={`Image ${idx + 1}`} onError={e => e.target.style.display = 'none'} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registrations */}
        <div className="detail-section">
          <h4>Registered Participants ({registrations.length})</h4>
          {registrations.length === 0 ? (
            <p className="no-participants">No registrations yet.</p>
          ) : (
            <div className="participants-list">
              {registrations.map((reg, idx) => {
                const u = reg.user;
                if (!u || typeof u === 'string') {
                  return (
                    <div key={idx} className="participant-card external">
                      <div className="participant-avatar-placeholder">?</div>
                      <div className="participant-info">
                        <span className="participant-name">External User</span>
                        <span className="participant-meta">Registered without profile</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="participant-card">
                    <div className="participant-avatar-placeholder">{(u.username || 'U').charAt(0).toUpperCase()}</div>
                    <div className="participant-info">
                      <span className="participant-name">{u.username}</span>
                      <span className="participant-meta">{u.email}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editData) return null;
    const gallery = editData.gallery || [];
    return (
      <div className="detail-body">
        <h3 className="edit-form-title">Edit Event</h3>
        <div className="form-group">
          <label>Event Type</label>
          <select name="type" value={editData.type} onChange={handleEditChange}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        {renderFormFields(editData, handleEditChange)}

        {/* Image management */}
        <div className="detail-section">
          <h4>Images</h4>
          {gallery.length > 0 ? (
            <div className="edit-gallery">
              {gallery.map((img, idx) => (
                <div key={idx} className="edit-thumb">
                  <img src={getImageUrl(img)} alt={`img ${idx}`} onError={e => e.target.style.display = 'none'} />
                  <button className="remove-img-btn" onClick={() => handleRemoveImage(img)} title="Remove image"><X size={12} /></button>
                </div>
              ))}
            </div>
          ) : <p className="no-participants">No images.</p>}
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label><Upload size={14} style={{ marginRight: '0.25rem' }} />Add Images</label>
            <input type="file" multiple accept="image/*" onChange={handleNewImages} />
            {newImages.length > 0 && <span className="new-img-count">{newImages.length} new image(s) selected</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={cancelEdit}>Cancel</button>
          <button type="button" className="submit-btn" onClick={handleSaveEdit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="tab-content">
      <h2 className="tab-title">Settings</h2>
      <div className="settings-section">
        <div className="settings-card">
          <h3>Account Information</h3>
          <div className="settings-item"><label>Username</label><p>{user?.username || 'admin'}</p></div>
          <div className="settings-item"><label>Email</label><p>{user?.email || 'admin@sewingcircle.com'}</p></div>
          <div className="settings-item"><label>Role</label><p>Administrator</p></div>
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
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Sewing Circle</h1>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <LayoutDashboard size={20} /><span>General</span>
          </button>
          <button className={`nav-item ${activeTab === 'event-management' ? 'active' : ''}`} onClick={() => setActiveTab('event-management')}>
            <Calendar size={20} /><span>Event Management</span>
          </button>
          <button className={`nav-item ${activeTab === 'profiles' ? 'active' : ''}`} onClick={() => setActiveTab('profiles')}>
            <UserCircle size={20} /><span>Profiles</span>
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /><span>Settings</span>
          </button>
          <button className="nav-item logout" onClick={async () => { if (window.confirm('Logout?')) await logout(); }}>
            <LogOut size={20} /><span>Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="user-info">
              <p className="user-name">{user?.username || 'Admin'}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
