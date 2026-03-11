import React, { useState, useEffect } from 'react';
import { X, Calendar, ThumbsUp, MessageCircle } from 'lucide-react';
import axios from 'axios';

const UserPostsModal = ({ userId, userName, onClose }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(response.data.posts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Posts by {userName}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={48} />
              <h3>No posts yet</h3>
              <p>This user hasn't created any posts</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post._id} className="post-item">
                  <div className="post-header">
                    <div className="post-meta">
                      <Calendar size={14} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="post-images">
                      {post.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${image}`}
                          alt={`Post image ${index + 1}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                      {post.images.length > 3 && (
                        <div className="more-images">+{post.images.length - 3} more</div>
                      )}
                    </div>
                  )}

                  <div className="post-stats">
                    <span>
                      <ThumbsUp size={14} />
                      {post.likes?.length || 0} likes
                    </span>
                    <span>
                      <MessageCircle size={14} />
                      {post.comments?.length || 0} comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPostsModal;
