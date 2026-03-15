import React from 'react';
import { User } from 'lucide-react';

const ProfileAbout = ({ user, isOwnProfile }) => {
  if (!user.bio && !isOwnProfile) return null;

  return (
    <div className="profile-card">
      <h3 className="card-title">
        <User size={20} />
        About
      </h3>
      {user.bio ? (
        <p className="about-text">{user.bio}</p>
      ) : (
        <p className="empty-state-text">
          Add a bio to tell others about yourself
        </p>
      )}
    </div>
  );
};

export default ProfileAbout;
