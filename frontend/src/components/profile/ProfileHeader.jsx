import React, { useState } from 'react';
import { Camera, Edit, MapPin, Mail } from 'lucide-react';
import axios from 'axios';

const ProfileHeader = ({ user, isOwnProfile, onEdit, onRefresh }) => {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingCover(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/upload/cover-photo', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onRefresh();
    } catch (error) {
      alert('Failed to upload cover photo: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingProfile(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/upload/profile-picture', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onRefresh();
      
      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      alert('Failed to upload profile picture: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingProfile(false);
    }
  };

  return (
    <div className="profile-header">
      {/* Cover Photo */}
      <div className="cover-photo-container">
        <img
          src={`http://localhost:5000${user.coverPhoto}`}
          alt="Cover"
          className="cover-photo"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x300/1e293b/ffffff?text=Cover+Photo';
          }}
        />
        {isOwnProfile && (
          <label className="upload-cover-btn">
            <Camera size={18} />
            {uploadingCover ? 'Uploading...' : 'Change Cover'}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoUpload}
              disabled={uploadingCover}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Profile Info */}
      <div className="profile-header-content">
        <div className="profile-picture-container">
          <img
            src={`http://localhost:5000${user.profilePicture}`}
            alt={`${user.firstName} ${user.lastName}`}
            className="profile-picture"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150/2563eb/ffffff?text=' + 
                user.firstName.charAt(0) + user.lastName.charAt(0);
            }}
          />
          {isOwnProfile && (
            <label className="upload-profile-btn">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploadingProfile}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
            </h1>
            {isOwnProfile && (
              <button onClick={onEdit} className="edit-profile-btn">
                <Edit size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {user.headline && (
            <p className="profile-headline">{user.headline}</p>
          )}

          <div className="profile-meta">
            {user.location && (
              <span className="meta-item">
                <MapPin size={16} />
                {user.location}
              </span>
            )}
            <span className="meta-item">
              <Mail size={16} />
              {user.email}
            </span>
          </div>

          {!isOwnProfile && (
            <div className="profile-actions">
              <button className="action-btn primary">
                Connect
              </button>
              <button className="action-btn secondary">
                Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
