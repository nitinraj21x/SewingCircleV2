import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import Reveal from '../shared/Reveal';
import RegistrationModal from './RegistrationModal';
import { eventsAPI } from '../../services/api';

const EventsSection = React.memo(() => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showAllPastEvents, setShowAllPastEvents] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch events from API with error handling and retry logic
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [upcomingResponse, pastResponse] = await Promise.all([
          eventsAPI.getUpcomingEvents(),
          eventsAPI.getPastEvents()
        ]);
        
        setUpcomingEvents(upcomingResponse.data);
        setPastEvents(pastResponse.data);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Error fetching events:', error);
        
        // Determine user-friendly error message
        let errorMessage = 'Unable to load events. Please try again.';
        
        if (!error.response) {
          // Network error
          errorMessage = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.response.status >= 500) {
          // Server error
          errorMessage = 'Our server is experiencing issues. Please try again in a few moments.';
        } else if (error.response.status === 404) {
          // Not found
          errorMessage = 'Events service is currently unavailable. Please try again later.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          // Authentication error
          errorMessage = 'Session expired. Please refresh the page.';
        }
        
        setError({
          message: errorMessage,
          canRetry: true,
          originalError: error
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [retryCount]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedEvent) return;
      
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          prevGalleryImage();
          break;
        case 'ArrowRight':
          nextGalleryImage();
          break;
        default:
          break;
      }
    };

    if (selectedEvent) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedEvent]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setCurrentGalleryIndex(0);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setCurrentGalleryIndex(0);
  };

  const nextGalleryImage = () => {
    if (selectedEvent && selectedEvent.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === selectedEvent.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevGalleryImage = () => {
    if (selectedEvent && selectedEvent.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? selectedEvent.gallery.length - 1 : prev - 1
      );
    }
  };

  const toggleShowAllPastEvents = () => {
    setShowAllPastEvents(!showAllPastEvents);
  };

  // Retry fetching events
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Get events to display based on showAllPastEvents state
  const eventsToDisplay = showAllPastEvents ? pastEvents : pastEvents.slice(0, 2);

  const handleRegister = (event) => {
    setSelectedEventForRegistration(event);
    setIsRegistrationOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationOpen(false);
    setSelectedEventForRegistration(null);
  };

  return (
    <section id="events" className="events-section">
      <div className="section-container">
        <div className="section-header">
          <Reveal>
            <h2 className="section-title">Events</h2>
            <p className="section-subtitle">Join our community gatherings and activities</p>
          </Reveal>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="events-loading">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="events-error">
            <div className="error-content">
              <AlertCircle size={48} className="error-icon" />
              <h3 className="error-title">Oops! Something went wrong</h3>
              <p className="error-message">{error.message}</p>
              {error.canRetry && (
                <button 
                  className="retry-button"
                  onClick={handleRetry}
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Events Content - Only show if no error and not loading */}
        {!loading && !error && (
          <>
            {/* Upcoming Events Subsection */}
            <div className="events-subsection">
              <Reveal>
                <h3 className="subsection-title">Upcoming Events</h3>
              </Reveal>
              
              {upcomingEvents.length === 0 ? (
                <div className="no-events-message">
                  <p>No upcoming events at the moment. Check back soon!</p>
                </div>
              ) : (
                <div className="upcoming-events-grid">
                  {upcomingEvents.map((event, index) => (
                    <Reveal key={event.id} delay={100 * (index + 1)}>
                      <div className="upcoming-event-card">
                        <div className="upcoming-event-header">
                          <h4 className="upcoming-event-title">{event.name}</h4>
                          <div className="upcoming-event-meta">
                            <div className="upcoming-event-meta-item">
                              <Calendar size={16} />
                              <span>{event.date}</span>
                            </div>
                            <div className="upcoming-event-meta-item">
                              <Clock size={16} />
                              <span>{event.time}</span>
                            </div>
                            <div className="upcoming-event-meta-item">
                              <MapPin size={16} />
                              <a 
                                href={event.venue} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="venue-link"
                              >
                                View Location <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div className="upcoming-event-description">
                          {event.description.split('\n\n').map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
                        
                        <button 
                          className="register-button"
                          onClick={() => handleRegister(event)}
                        >
                          Register
                        </button>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Past Events Subsection */}
            <div className="events-subsection">
              <Reveal>
                <h3 className="subsection-title">Past Events</h3>
                <p className="events-subsection-subtitle">Sewing Circle Event Gallery: 2025 Meetups</p>
              </Reveal>
              
              {pastEvents.length === 0 ? (
                <div className="no-events-message">
                  <p>No past events to display yet.</p>
                </div>
              ) : (
                <div className={`past-events-grid ${showAllPastEvents ? 'expanded' : 'limited'}`}>
                  {eventsToDisplay.map((event, index) => (
                    <Reveal key={event.id} delay={100 * (index + 1)}>
                      <div 
                        className="past-event-card"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(http://localhost:5000${event.coverImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="past-event-overlay">
                          <h4 className="past-event-title">{event.header}</h4>
                          <div className="past-event-meta">
                            <div className="past-event-meta-item">
                              <Users size={16} />
                              <span>{event.participants} participants</span>
                            </div>
                            <div className="past-event-meta-item">
                              <MapPin size={16} />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <button 
                            className="read-more-button"
                            onClick={() => handleEventClick(event)}
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                  
                  {/* View All Events Button Card */}
                  {!showAllPastEvents && (
                    <Reveal delay={100 * (eventsToDisplay.length + 1)}>
                      <div className="view-all-events-card">
                        <div className="view-all-content">
                          <h4 className="view-all-title">View All Events</h4>
                          <p className="view-all-subtitle">Explore our complete event history</p>
                          <button 
                            className="view-all-button"
                            onClick={toggleShowAllPastEvents}
                          >
                            View All ({pastEvents.length} Events)
                          </button>
                        </div>
                      </div>
                    </Reveal>
                  )}
                  
                  {/* Show Less Button when expanded */}
                  {showAllPastEvents && (
                    <Reveal delay={100 * (pastEvents.length + 1)}>
                      <div className="view-all-events-card">
                        <div className="view-all-content">
                          <h4 className="view-all-title">Show Less</h4>
                          <p className="view-all-subtitle">Return to summary view</p>
                          <button 
                            className="view-all-button"
                            onClick={toggleShowAllPastEvents}
                          >
                            Show Less
                          </button>
                        </div>
                      </div>
                    </Reveal>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={closeModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              ×
            </button>
            
            <div className="modal-content-split">
              {/* Left Side - Event Details */}
              <div className="modal-left">
                <div className="modal-header">
                  <h2 className="modal-title">{selectedEvent.header}</h2>
                  <p className="modal-theme">{selectedEvent.theme}</p>
                </div>

                <div className="modal-details">
                  <div className="modal-description">
                    <h3>About This Event</h3>
                    <p>{selectedEvent.fullDescription}</p>
                  </div>

                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <h4>Location</h4>
                      <p>{selectedEvent.location}</p>
                    </div>
                    <div className="modal-info-item">
                      <h4>Duration</h4>
                      <p>{selectedEvent.duration}</p>
                    </div>
                    <div className="modal-info-item">
                      <h4>Participants</h4>
                      <p>{selectedEvent.participants} members</p>
                    </div>
                    <div className="modal-info-item">
                      <h4>Facilitator</h4>
                      <p>{selectedEvent.facilitator}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Image Gallery */}
              <div className="modal-right">
                <div className="modal-gallery">
                  <div className="gallery-main-image">
                    <img 
                      src={`http://localhost:5000${selectedEvent.gallery[currentGalleryIndex]}`}
                      alt={`${selectedEvent.header} - Image ${currentGalleryIndex + 1}`}
                    />
                    
                    {selectedEvent.gallery.length > 1 && (
                      <>
                        <button 
                          className="gallery-nav gallery-prev"
                          onClick={prevGalleryImage}
                        >
                          ‹
                        </button>
                        <button 
                          className="gallery-nav gallery-next"
                          onClick={nextGalleryImage}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  
                  {selectedEvent.gallery.length > 1 && (
                    <div className="gallery-controls">
                      <div className="gallery-radio-buttons">
                        {selectedEvent.gallery.map((image, index) => (
                          <label key={index} className="gallery-radio-item">
                            <input
                              type="radio"
                              name="gallery-image"
                              className="gallery-radio-input"
                              checked={index === currentGalleryIndex}
                              onChange={() => setCurrentGalleryIndex(index)}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="gallery-counter">
                        {currentGalleryIndex + 1} of {selectedEvent.gallery.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationOpen}
        onClose={closeRegistrationModal}
        eventName={selectedEventForRegistration?.name}
      />
    </section>
  );
});

export default EventsSection;