import React, { useState } from 'react';
import { X } from 'lucide-react';

const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: event?.type || 'upcoming',
    name: event?.name || '',
    date: event?.date || '',
    time: event?.time || '',
    venue: event?.venue || '',
    description: event?.description || '',
    header: event?.header || '',
    theme: event?.theme || '',
    teaser: event?.teaser || '',
    fullDescription: event?.fullDescription || '',
    location: event?.location || '',
    duration: event?.duration || '',
    participants: event?.participants || '',
    facilitator: event?.facilitator || '',
    images: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="event-form-modal">
        <div className="form-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={onCancel} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Event Type:</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          {formData.type === 'upcoming' ? (
            <>
              <div className="form-group">
                <label>Event Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time:</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Venue URL:</label>
                <input
                  type="url"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Header:</label>
                <input
                  type="text"
                  name="header"
                  value={formData.header}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Theme:</label>
                <input
                  type="text"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teaser:</label>
                <textarea
                  name="teaser"
                  value={formData.teaser}
                  onChange={handleChange}
                  rows="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Description:</label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration:</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Participants:</label>
                <input
                  type="number"
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Facilitator:</label>
                <input
                  type="text"
                  name="facilitator"
                  value={formData.facilitator}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Images:</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleChange}
                  multiple
                  accept="image/*"
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {event ? 'Update' : 'Create'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;