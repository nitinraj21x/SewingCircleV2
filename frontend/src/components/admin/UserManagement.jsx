import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending'); // pending, all, approved, rejected, suspended
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        alert('Please login as admin first');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      try {
        const statsResponse = await axios.get('http://localhost:5000/api/admin/users/stats/overview', { headers });
        setStats(statsResponse.data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      // Fetch users based on filter
      if (filter === 'pending') {
        const response = await axios.get('http://localhost:5000/api/admin/users/pending', { headers });
        console.log('Pending users response:', response.data);
        setPendingUsers(response.data.users || []);
        setUsers([]);
      } else {
        const status = filter === 'all' ? '' : filter;
        const response = await axios.get(`http://localhost:5000/api/admin/users?status=${status}`, { headers });
        console.log('Users response:', response.data);
        setUsers(response.data.users || []);
        setPendingUsers([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Error loading users: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('User approved successfully!');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error approving user: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('User rejected successfully!');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error rejecting user: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/suspend`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('User suspended successfully!');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error suspending user: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to reactivate this user?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('User reactivated successfully!');
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error reactivating user: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const displayUsers = filter === 'pending' ? pendingUsers : users;
  const filteredUsers = displayUsers.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.headline?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div>
          <h2>
            <Users size={24} />
            User Management
          </h2>
          <p>Manage user registrations and accounts</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="refresh-btn"
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          background: '#f0f9ff', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          fontSize: '0.875rem',
          color: '#0369a1'
        }}>
          <strong>Debug Info:</strong><br />
          Filter: {filter}<br />
          Pending Users: {pendingUsers.length}<br />
          All Users: {users.length}<br />
          Loading: {loading ? 'Yes' : 'No'}<br />
          Access Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="user-stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon online">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.online}</div>
              <div className="stat-label">Online Now</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="user-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <Clock size={16} />
            Pending ({stats?.pending || 0})
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Users size={16} />
            All Users
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <CheckCircle size={16} />
            Approved
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <XCircle size={16} />
            Rejected
          </button>
          <button
            className={`filter-btn ${filter === 'suspended' ? 'active' : ''}`}
            onClick={() => setFilter('suspended')}
          >
            <XCircle size={16} />
            Suspended
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No users found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms'
              : filter === 'pending'
              ? 'No pending user registrations at the moment'
              : 'No users match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-card-header">
                <img
                  src={`http://localhost:5000${user.profilePicture}`}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="user-info">
                  <h3>{user.firstName} {user.lastName}</h3>
                  <p className="user-email">{user.email}</p>
                  {user.headline && <p className="user-headline">{user.headline}</p>}
                </div>
                <span className={`status-badge ${user.status}`}>
                  {user.status}
                </span>
              </div>

              <div className="user-card-body">
                {user.location && (
                  <p className="user-detail">
                    <strong>Location:</strong> {user.location}
                  </p>
                )}
                {user.bio && (
                  <p className="user-bio">{user.bio.substring(0, 150)}{user.bio.length > 150 ? '...' : ''}</p>
                )}
                {user.skills && user.skills.length > 0 && (
                  <div className="user-skills">
                    {user.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {user.skills.length > 5 && (
                      <span className="skill-tag">+{user.skills.length - 5} more</span>
                    )}
                  </div>
                )}
                <p className="user-date">
                  Registered: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="user-card-actions">
                {user.status === 'pending' && (
                  <>
                    <button
                      className="action-btn approve"
                      onClick={() => handleApprove(user._id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleReject(user._id)}
                      disabled={actionLoading}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                )}
                {user.status === 'approved' && (
                  <button
                    className="action-btn suspend"
                    onClick={() => handleSuspend(user._id)}
                    disabled={actionLoading}
                  >
                    <XCircle size={16} />
                    Suspend
                  </button>
                )}
                {user.status === 'suspended' && (
                  <button
                    className="action-btn approve"
                    onClick={() => handleReactivate(user._id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={16} />
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
