import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, MessageCircle, Share2, MoreHorizontal,
  Trash2, Edit, Send
} from 'lucide-react';
import { postsAPI, getImageUrl } from '../../services/api';

const PostCard = ({ post, currentUser, onPostUpdated, onPostDeleted }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  const isOwnPost = post.author._id === currentUser?._id;

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post._id);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
      onPostUpdated(response.data.post);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    try {
      setCommenting(true);
      const response = await postsAPI.commentOnPost(post._id, commentText);
      onPostUpdated(response.data.post);
      setCommentText('');
      setShowComments(true);
    } catch (error) {
      console.error('Error commenting:', error);
      alert('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(post._id);
      onPostDeleted(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        {post.author.profilePicture ? (
          <img 
            src={getImageUrl(post.author.profilePicture)}
            alt={`${post.author.firstName} ${post.lastName}`}
            className="post-avatar"
            onClick={() => navigate(`/profile/${post.author._id}`)}
            onError={(e) => {
              e.target.style.display = 'none';
              const icon = document.createElement('div');
              icon.className = 'post-avatar';
              icon.style.display = 'flex';
              icon.style.alignItems = 'center';
              icon.style.justifyContent = 'center';
              icon.style.background = '#e2e8f0';
              icon.style.cursor = 'pointer';
              icon.onclick = () => navigate(`/profile/${post.author._id}`);
              icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
              e.target.parentNode.insertBefore(icon, e.target);
            }}
          />
        ) : (
          <div 
            className="post-avatar" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${post.author._id}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
        <div className="post-author-info">
          <h4 onClick={() => navigate(`/profile/${post.author._id}`)}>
            {post.author.firstName} {post.author.lastName}
          </h4>
          <p>{post.author.headline || 'Member'}</p>
          <span className="post-time">{formatDate(post.createdAt)}</span>
        </div>
        
        {isOwnPost && (
          <div className="post-menu">
            <button 
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={handleDelete}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className={`post-images post-images-${post.images.length}`}>
          {post.images.map((image, index) => (
            <img 
              key={index}
              src={getImageUrl(image)}
              alt={`Post image ${index + 1}`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="post-stats">
        <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
        <button className="action-btn">
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Add Comment */}
          <form className="add-comment" onSubmit={handleComment}>
            {currentUser?.profilePicture ? (
              <img 
                src={getImageUrl(currentUser.profilePicture)}
                alt="Your avatar"
                className="comment-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const icon = document.createElement('div');
                  icon.className = 'comment-avatar';
                  icon.style.display = 'flex';
                  icon.style.alignItems = 'center';
                  icon.style.justifyContent = 'center';
                  icon.style.background = '#e2e8f0';
                  icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  e.target.parentNode.insertBefore(icon, e.target);
                }}
              />
            ) : (
              <div className="comment-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={commenting}
            />
            <button 
              type="submit"
              disabled={commenting || !commentText.trim()}
              className="send-comment-btn"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="comments-list">
              {post.comments.map((comment) => (
                <div key={comment._id} className="comment">
                  {comment.author.profilePicture ? (
                    <img 
                      src={getImageUrl(comment.author.profilePicture)}
                      alt={`${comment.author.firstName} ${comment.author.lastName}`}
                      className="comment-avatar"
                      onClick={() => navigate(`/profile/${comment.author._id}`)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const icon = document.createElement('div');
                        icon.className = 'comment-avatar';
                        icon.style.display = 'flex';
                        icon.style.alignItems = 'center';
                        icon.style.justifyContent = 'center';
                        icon.style.background = '#e2e8f0';
                        icon.style.cursor = 'pointer';
                        icon.onclick = () => navigate(`/profile/${comment.author._id}`);
                        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                        e.target.parentNode.insertBefore(icon, e.target);
                      }}
                    />
                  ) : (
                    <div 
                      className="comment-avatar" 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${comment.author._id}`)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  )}
                  <div className="comment-content">
                    <div className="comment-bubble">
                      <h5 onClick={() => navigate(`/profile/${comment.author._id}`)}>
                        {comment.author.firstName} {comment.author.lastName}
                      </h5>
                      <p>{comment.content}</p>
                    </div>
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
