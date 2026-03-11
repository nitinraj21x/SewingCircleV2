import React, { useState } from 'react';
import { GraduationCap, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';

const ProfileEducation = ({ education, isOwnProfile, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setFormData({
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (edu) => {
    setFormData({
      school: edu.school,
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
      endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
      current: edu.current,
      description: edu.description || ''
    });
    setEditingId(edu._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:5000/api/profile/education/${editingId}`
        : 'http://localhost:5000/api/profile/education';
      
      const method = editingId ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setShowForm(false);
      onUpdate();
    } catch (error) {
      alert('Error saving education: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eduId) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/profile/education/${eduId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      alert('Error deleting education: ' + (error.response?.data?.message || error.message));
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
          <GraduationCap size={20} />
          Education
        </h3>
        {isOwnProfile && !showForm && (
          <button onClick={handleAdd} className="add-btn">
            <Plus size={18} />
            Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="education-form">
          <div className="form-group">
            <label>School *</label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              required
              placeholder="e.g., Stanford University"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g., Bachelor's"
              />
            </div>
            <div className="form-group">
              <label>Field of Study</label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>
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
              I currently study here
            </label>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder="Activities, achievements, etc..."
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

      <div className="education-list">
        {education.length === 0 ? (
          <p className="empty-state-text">
            {isOwnProfile ? 'Add your education' : 'No education added yet'}
          </p>
        ) : (
          education.map((edu) => (
            <div key={edu._id} className="education-item">
              <div className="education-icon">
                <GraduationCap size={24} />
              </div>
              <div className="education-content">
                <h4 className="education-school">{edu.school}</h4>
                {(edu.degree || edu.fieldOfStudy) && (
                  <p className="education-degree">
                    {edu.degree}{edu.degree && edu.fieldOfStudy && ', '}{edu.fieldOfStudy}
                  </p>
                )}
                <p className="education-dates">
                  {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                </p>
                {edu.description && (
                  <p className="education-description">{edu.description}</p>
                )}
              </div>
              {isOwnProfile && (
                <div className="education-actions">
                  <button onClick={() => handleEdit(edu)} className="icon-btn">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(edu._id)} className="icon-btn delete">
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

export default ProfileEducation;
