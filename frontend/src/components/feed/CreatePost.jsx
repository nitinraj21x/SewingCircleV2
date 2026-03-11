import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import axios from 'axios';

const CreatePost = ({ user, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [posting, setPosting] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) {
      alert('Please add some content or images');
      return;
    }

    try {
      setPosting(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('content', content);
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await axios.post(
        'http://localhost:5000/api/posts',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      onPostCreated(response.data.post);
      setContent('');
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        {user.profilePicture ? (
          <img 
            src={`http://localhost:5000${user.profilePicture}`}
            alt={`${user.firstName} ${user.lastName}`}
            className="create-post-avatar"
            onError={(e) => {
              e.target.style.display = 'none';
              const icon = document.createElement('div');
              icon.className = 'create-post-avatar';
              icon.style.display = 'flex';
              icon.style.alignItems = 'center';
              icon.style.justifyContent = 'center';
              icon.style.background = '#e2e8f0';
              icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
              e.target.parentNode.insertBefore(icon, e.target);
            }}
          />
        ) : (
          <div className="create-post-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={posting}
        />
      </div>

      {imagePreviews.length > 0 && (
        <div className="image-previews">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="image-preview">
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(index)}
                disabled={posting}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="create-post-actions">
        <label className="image-upload-btn" title="Add images">
          <Image size={20} />
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            disabled={posting || images.length >= 5}
            style={{ display: 'none' }}
          />
        </label>

        <button
          className="post-submit-btn"
          onClick={handleSubmit}
          disabled={posting || (!content.trim() && images.length === 0)}
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
