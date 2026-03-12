import React, { useState } from 'react';
import { Briefcase, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { profileAPI } from '../../services/api';

const ProfileExperience = ({ experience, isOwnProfile, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (exp) => {
    setFormData({
      title: exp.title,
      company: exp.company,
      location: exp.location || '',
      startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      current: exp.current,
      description: exp.description || ''
    });
    setEditingId(exp._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await profileAPI.updateExperience(editingId, formData);
      } else {
        await profileAPI.addExperience(formData);
      }

      setShowForm(false);
      onUpdate();
    } catch (error) {
      alert('Error saving experience: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expId) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    try {
      await profileAPI.deleteExperience(expId);
      onUpdate();
    } catch (error) {
      alert('Error deleting experience: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-card">
      <div className="card-header">
        <h3 className="card-title">
          <Briefcase size={20} />
          Experience
        </h3>
        {isOwnProfile && !showForm && (
          <button onClick={handleAdd} className="add-btn">
            <Plus size={18} />
            Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="experience-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                placeholder="e.g., Tech Corp"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.current}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
              />
              I currently work here
            </label>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="experience-list">
        {experience.length === 0 ? (
          <p className="empty-state-text">
            {isOwnProfile ? 'Add your work experience' : 'No experience added yet'}
          </p>
        ) : (
          experience.map((exp) => (
            <div key={exp._id} className="experience-item">
              <div className="experience-icon">
                <Briefcase size={24} />
              </div>
              <div className="experience-content">
                <h4 className="experience-title">{exp.title}</h4>
                <p className="experience-company">{exp.company}</p>
                {exp.location && (
                  <p className="experience-location">{exp.location}</p>
                )}
                <p className="experience-dates">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </p>
                {exp.description && (
                  <p className="experience-description">{exp.description}</p>
                )}
              </div>
              {isOwnProfile && (
                <div className="experience-actions">
                  <button onClick={() => handleEdit(exp)} className="icon-btn">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(exp._id)} className="icon-btn delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileExperience;
