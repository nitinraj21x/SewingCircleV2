import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Mail, MapPin, FileText, UserCheck, UserX, Circle } from 'lucide-react';
import { adminAPI, getImageUrl } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import UserPostsModal from './UserPostsModal';

const ProfilesManagement = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPostsModal, setShowPostsModal] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        return;
      }

      // Fetch detailed profiles with post counts
      const response = await adminAPI.getDetailedProfiles();

      setProfiles(response.data.users || []);
      
      // Calculate stats
      const users = response.data.users || [];
      setStats({
        total: users.length,
        online: users.filter(u => u.isOnline).length,
        withPosts: users.filter(u => u.postCount > 0).length,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
    }
  };

  const handleViewPosts = (user) => {
    setSelectedUser(user);
    setShowPostsModal(true);
  };

  const handleCloseModal = () => {
    setShowPostsModal(false);
    setSelectedUser(null);
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      profile.firstName?.toLowerCase().includes(search) ||
      profile.lastName?.toLowerCase().includes(search) ||
      profile.email?.toLowerCase().includes(search) ||
      profile.location?.toLowerCase().includes(search) ||
      profile.headline?.toLowerCase().includes(search)
    );
  });

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="profiles-management">
      <div className="profiles-header">
        <div>
          <h2>
            <Users size={24} />
            User Profiles
          </h2>
          <p>View detailed information about all registered users</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="user-stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Profiles</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <Circle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.online}</div>
              <div className="stat-label">Online Now</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon online">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.withPosts}</div>
              <div className="stat-label">Active Posters</div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="profiles-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Profiles Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profiles...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No profiles found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'No user profiles have been created yet'}
          </p>
        </div>
      ) : (
        <div className="profiles-table-container">
          <table className="profiles-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Posts</th>
                <th>Followers</th>
                <th>Following</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile) => (
                <tr key={profile._id}>
                  <td>
                    <div className="user-cell">
                      <img
                        src={getImageUrl(profile.profilePicture)}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="user-avatar-small"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const icon = document.createElement('div');
                          icon.className = 'user-avatar-small';
                          icon.style.display = 'flex';
                          icon.style.alignItems = 'center';
                          icon.style.justifyContent = 'center';
                          icon.style.background = '#e2e8f0';
                          icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                          e.target.parentNode.insertBefore(icon, e.target);
                        }}
                      />
                      <div className="user-info">
                        <span className="user-name">
                          {profile.firstName} {profile.lastName}
                        </span>
                        {profile.headline && (
                          <span className="user-headline">{profile.headline}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {profile.email}
                    </div>
                  </td>
                  <td>
                    <button
                      className="post-count-btn"
                      onClick={() => handleViewPosts(profile)}
                      disabled={profile.postCount === 0}
                    >
                      <FileText size={14} />
                      {profile.postCount || 0}
                    </button>
                  </td>
                  <td>
                    <div className="stat-cell">
                      <UserCheck size={14} />
                      {profile.followers?.length || 0}
                    </div>
                  </td>
                  <td>
                    <div className="stat-cell">
                      <UserX size={14} />
                      {profile.following?.length || 0}
                    </div>
                  </td>
                  <td>
                    <div className="location-cell">
                      {profile.location ? (
                        <>
                          <MapPin size={14} />
                          {profile.location}
                        </>
                      ) : (
                        <span className="text-muted">Not set</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${profile.isOnline ? 'online' : 'offline'}`}>
                      <Circle size={8} fill="currentColor" />
                      {profile.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn-small view"
                      onClick={() => handleViewProfile(profile._id)}
                      title="View Profile"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts Modal */}
      {showPostsModal && selectedUser && (
        <UserPostsModal
          userId={selectedUser._id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProfilesManagement;
