import React, { useState } from 'react';
import { Award, Plus, X, Save } from 'lucide-react';
import { profileAPI } from '../../services/api';

const ProfileSkills = ({ skills, isOwnProfile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [editedSkills, setEditedSkills] = useState([...skills]);
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    
    if (editedSkills.includes(skillInput.trim())) {
      alert('Skill already added');
      return;
    }

    setEditedSkills([...editedSkills, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditedSkills(editedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileAPI.updateSkills(editedSkills);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      alert('Error updating skills: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedSkills([...skills]);
    setSkillInput('');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditedSkills([...skills]);
    setIsEditing(true);
  };

  return (
    <div className="profile-card">
      <div className="card-header">
        <h3 className="card-title">
          <Award size={20} />
          Skills
        </h3>
        {isOwnProfile && !isEditing && (
          <button onClick={handleEdit} className="add-btn">
            <Plus size={18} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="skills-edit">
          <div className="skill-input-group">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="Add a skill..."
              className="skill-input"
            />
            <button onClick={handleAddSkill} className="add-skill-btn">
              <Plus size={16} />
            </button>
          </div>

          <div className="skills-grid editable">
            {editedSkills.map((skill, index) => (
              <div key={index} className="skill-tag editable">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="remove-skill-btn">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="save-btn" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="skills-grid">
          {skills.length === 0 ? (
            <p className="empty-state-text">
              {isOwnProfile ? 'Add your skills' : 'No skills added yet'}
            </p>
          ) : (
            skills.map((skill, index) => (
              <div key={index} className="skill-tag">
                {skill}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSkills;
