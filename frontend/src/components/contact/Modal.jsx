import React, { useCallback, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../../config/emailjs';

const Modal = React.memo(({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contribution: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const validateName = (name) => {
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 20) return 'Name must be no more than 20 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (!formData.contribution) newErrors.contribution = 'Please select a contribution type';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('EmailJS Config:', EMAILJS_CONFIG);
      
      // Initialize EmailJS
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      
      // Use the most basic template parameters that work with default EmailJS templates
      const templateParams = {
        to_name: "Sewing Circle Team",
        from_name: formData.name,
        from_email: formData.email,
        to_email: "ash.tvm@gmail.com",
        contribution_type: formData.contribution,
        message: `New member application for The Sewing Circle:

Name: ${formData.name}
Email: ${formData.email}
Contribution Type: ${formData.contribution}

Please follow up with this new member.`
      };
      
      console.log('Sending email with params:', templateParams);
      console.log('Using Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('Using Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );
      
      console.log('Email sent successfully:', result);
      
      // Send to second email
      const templateParams2 = {
        ...templateParams,
        to_email: "sewingcircleservice@gmail.com"
      };
      
      const result2 = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams2
      );
      
      console.log('Second email sent successfully:', result2);
      
      setNotification({
        type: 'success',
        message: "Thank you for joining! We'll be in touch soon."
      });
      setFormData({ name: '', email: '', contribution: '' });
      
      // Auto close notification and modal after 3 seconds
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error text:', error.text);
      console.error('Error status:', error.status);
      
      // More specific error messages
      let errorMessage = "There was an error submitting your application. ";
      
      if (error.status === 400) {
        errorMessage += "EmailJS configuration error. Check your Service ID, Template ID, or template variables.";
      } else if (error.status === 401) {
        errorMessage += "EmailJS authentication failed. Check your Public Key.";
      } else if (error.status === 404) {
        errorMessage += "EmailJS service or template not found. Check your IDs.";
      } else {
        errorMessage += `Error: ${error.text || error.message || 'Unknown error'}`;
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      
      // Auto close error notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div 
        className="modal-backdrop" 
        onClick={onClose}
      ></div>
      
      {/* Custom Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon-text">
              {notification.type === 'success' ? (
                <CheckCircle size={20} className={`notification-icon ${notification.type}`} />
              ) : (
                <AlertCircle size={20} className={`notification-icon ${notification.type}`} />
              )}
              <p className="notification-text">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="notification-close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div className="modal-content animate-fade-in-up">
        <button 
          onClick={onClose}
          className="modal-close"
        >
          <X size={24} />
        </button>
        
        <h3 className="modal-title">Join The Circle</h3>
        <p className="modal-subtitle">Become part of the movement weaving a stronger future.</p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Name (3-20 characters)
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Jane Doe" 
              required 
              minLength={3}
              maxLength={20}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="jane@example.com" 
              required 
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Contribution Type</label>
            <select 
              name="contribution"
              value={formData.contribution}
              onChange={handleInputChange}
              className={`form-input ${errors.contribution ? 'error' : ''}`}
              required
            >
              <option value="">Select how you'd like to contribute</option>
              <option value="volunteer">Volunteer</option>
              <option value="supporter">Supporter (Non-Volunteer)</option>
            </select>
            {errors.contribution && <p className="form-error">{errors.contribution}</p>}
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="form-submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
});

export default Modal;