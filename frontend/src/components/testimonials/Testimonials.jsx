import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from '../shared/Reveal';

const Testimonials = React.memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');

  const testimonials = [
    {
      id: 1,
      name: "Madan R",
      role: "Technology Business Executive",
      content: "The Sewing Circle provides a great forum for meaningful dialogue and relationship-building. Participation has enabled substantive exchange of insights from technology to business to society with diverse individuals. Looking forward to see this community growing in 2026 and beyond"
    },
    {
      id: 2,
      name: "Kranthikumar Sivapuram",
      role: "Engagement Partner",
      content: "This forum has reminded me how valuable genuine networking can be. The sewing circle concept creates a comfortable space for IT consultants to share industry insights, real experiences, and new ideas. When life gets busy and networking slips to the back burner, this feels like a refreshing and much-needed reset."
    },
    {
      id: 3,
      name: "Venkatesh Narayan",
      role: "Senior CX Transformation Lead",
      content: "Through SewingCircle, I personally connected with professionals from different IT companies in a relaxed, happy-hour setting. These genuine conversations helped me build meaningful relationships, better understand the job market, and gain insights I wouldn't have found through traditional networking. Those connections directly opened doors for me and ultimately helped me land a job. SewingCircle feels less like a meetup and more like a supportive community that fosters real human connections and career growth."
    },
    {
      id: 4,
      name: "Priya Sharma",
      role: "Product Manager",
      content: "Joining the Sewing Circle has been transformative for my career. The diverse perspectives and collaborative environment have helped me develop new skills and approaches to problem-solving. The mentorship opportunities and peer support have been invaluable in navigating complex product challenges."
    },
    {
      id: 5,
      name: "Rajesh Kumar",
      role: "Software Architect",
      content: "What sets Sewing Circle apart is the authentic connections formed here. Beyond professional networking, I've found a community that genuinely cares about each other's growth. The technical discussions and knowledge sharing sessions have significantly enhanced my architectural thinking."
    },
    {
      id: 6,
      name: "Sarah Johnson",
      role: "UX Design Lead",
      content: "The Sewing Circle has provided me with a platform to share my design expertise while learning from professionals across different domains. The cross-functional collaboration opportunities have broadened my perspective and improved my design thinking process."
    },
    {
      id: 7,
      name: "Amit Patel",
      role: "DevOps Engineer",
      content: "Through Sewing Circle, I've discovered the power of community-driven learning. The workshops and discussion circles have helped me stay current with industry trends while building meaningful professional relationships that extend beyond work."
    },
    {
      id: 8,
      name: "Lisa Chen",
      role: "Data Scientist",
      content: "The collaborative projects at Sewing Circle have allowed me to apply my data science skills to real-world social impact initiatives. Working with diverse teams has enhanced my ability to communicate complex technical concepts to non-technical stakeholders."
    },
    {
      id: 9,
      name: "Michael Rodriguez",
      role: "Startup Founder",
      content: "Sewing Circle has been instrumental in my entrepreneurial journey. The network of experienced professionals has provided valuable insights, mentorship, and even potential partnerships. The supportive environment encourages innovation and risk-taking."
    }
  ];

  const testimonialsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSlideChange('next');
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = (direction) => {
    if (isTransitioning) return;
    
    setSlideDirection(direction);
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentSlide((prevSlide) => 
          prevSlide === totalSlides - 1 ? 0 : prevSlide + 1
        );
      } else {
        setCurrentSlide((prevSlide) => 
          prevSlide === 0 ? totalSlides - 1 : prevSlide - 1
        );
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleIndicatorClick = (slideIndex) => {
    if (slideIndex !== currentSlide && !isTransitioning) {
      const direction = slideIndex > currentSlide ? 'next' : 'prev';
      setSlideDirection(direction);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentSlide(slideIndex);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300);
    }
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * testimonialsPerSlide;
    return testimonials.slice(startIndex, startIndex + testimonialsPerSlide);
  };

  return (
    <div className="testimonials-container">
      <div className="section-header">
        <Reveal>
          <h2 className="section-title">Community Voices</h2>
          <p className="section-subtitle">Real experiences from our community members</p>
        </Reveal>
      </div>
      
      {/* Testimonials Slider */}
      <div className="testimonials-slider">
        <Reveal>
          <div className="testimonials-wrapper">
            {/* Navigation Buttons */}
            <button 
              className="testimonial-nav testimonial-nav-prev"
              onClick={() => handleSlideChange('prev')}
              disabled={isTransitioning}
            >
              <ChevronLeft size={24} />
            </button>
            
            {/* Testimonials Container with Fixed Height */}
            <div className="testimonials-container-fixed">
              <div className="testimonials-grid">
                {getCurrentTestimonials().map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className={`testimonial-card testimonial-position-${index} ${
                      isTransitioning ? `transitioning-${slideDirection}` : ''
                    }`}
                  >
                    <Quote className="testimonial-quote-icon" size={32} />
                    <div className="testimonial-content">
                      <p className="testimonial-text">
                        "{testimonial.content}"
                      </p>
                    </div>
                    <div className="testimonial-author">
                      <h4 className="testimonial-name">
                        {testimonial.name}
                      </h4>
                      <p className="testimonial-role">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button 
              className="testimonial-nav testimonial-nav-next"
              onClick={() => handleSlideChange('next')}
              disabled={isTransitioning}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </Reveal>
        
        {/* Slide Indicators */}
        <div className="testimonial-indicators">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`testimonial-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default Testimonials;