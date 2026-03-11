import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, MapPin, Calendar, Edit, Mail, Link as LinkIcon,
  Briefcase, GraduationCap, Award, Users, ArrowLeft,
  Home, Bell, MessageCircle, Search, User, LogOut
} from 'lucide-react';
import axios from 'axios';
import ProfileHeader from './ProfileHeader';
import ProfileAbout from './ProfileAbout';
import ProfileExperience from './ProfileExperience';
import ProfileEducation from './ProfileEducation';
import ProfileSkills from './ProfileSkills';
import './profile.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCurrentUser();
  }, [userId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentUser(response.data.user);
      setIsOwnProfile(response.data.user._id === userId);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/profile/${userId}`);
      setUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Profile Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/feed')} className="back-btn">
          <ArrowLeft size={18} />
          Back to Feed
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="profile-page">
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
              className="nav-icon-btn" 
              title="Home"
              onClick={() => navigate('/feed')}
            >
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
              className="nav-icon-btn active" 
              title="Profile"
              onClick={() => currentUser && navigate(`/profile/${currentUser._id}`)}
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

      <div className="profile-container">
        <ProfileHeader 
          user={user}
          isOwnProfile={isOwnProfile}
          onEdit={handleEditProfile}
          onRefresh={fetchProfile}
        />

        <div className="profile-content">
          <div className="profile-main">
            <ProfileAbout user={user} isOwnProfile={isOwnProfile} />
            <ProfileExperience 
              experience={user.experience || []}
              isOwnProfile={isOwnProfile}
              onUpdate={fetchProfile}
            />
            <ProfileEducation 
              education={user.education || []}
              isOwnProfile={isOwnProfile}
              onUpdate={fetchProfile}
            />
          </div>

          <div className="profile-sidebar">
            <ProfileSkills 
              skills={user.skills || []}
              isOwnProfile={isOwnProfile}
              onUpdate={fetchProfile}
            />

            {/* Connection Stats */}
            <div className="profile-card">
              <h3 className="card-title">
                <Users size={20} />
                Connections
              </h3>
              <div className="connection-stats">
                <div className="stat-item">
                  <span className="stat-value">{user.connections || 0}</span>
                  <span className="stat-label">Connections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.followers || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.following || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="profile-card">
              <h3 className="card-title">
                <Calendar size={20} />
                Member Since
              </h3>
              <p className="member-since">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
