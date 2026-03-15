import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Navigation Component
 * 
 * Provides the main navigation bar for the Sewing Circle website.
 * Features responsive design with mobile hamburger menu and smooth scrolling.
 * Highlights active section based on scroll position.
 */
const Navigation = React.memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();

  // Navigation links configuration - updated to match requested sections
  const navLinks = useMemo(() => [
    { name: 'Home', href: '#hero', id: 'hero' },
    { name: 'About Us', href: '#about', id: 'about' },
    { name: 'Objectives', href: '#objectives', id: 'objectives' },
    { name: 'Vision', href: '#vision', id: 'vision' },
    { name: 'Future', href: '#future', id: 'future' },
    { name: 'Community', href: '#community', id: 'community' },
    { name: 'Events', href: '#events', id: 'events' },
    { name: 'Contact Us', href: '#contact', id: 'contact' },
  ], []);

  // Handle scroll effect for navigation background and active section detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Detect active section based on scroll position
      const sections = navLinks.map(link => document.querySelector(link.href));
      const scrollPosition = window.scrollY + 100; // Offset for better detection
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  // Toggle mobile menu handler
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  // Close mobile menu handler
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Handle login navigation
  const handleLogin = useCallback(() => {
    navigate('/login');
    closeMobileMenu();
  }, [navigate, closeMobileMenu]);

  return (
    // Fixed navigation bar with dynamic styling based on scroll state
    <nav 
      className={`navigation ${isScrolled ? 'scrolled' : 'transparent'}`}
    >
      <div className="navigation-container">
        {/* Logo/Brand */}
        <div className="navigation-brand">
          SEWING<span className="light-text">CIRCLE</span>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="navigation-menu">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className={`navigation-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.name}
            </a>
          ))}
          
          {/* Login Button - Icon Only */}
          <button 
            onClick={handleLogin}
            className="navigation-login-btn"
            aria-label="Login"
            title="Login"
          >
            <LogIn size={20} />
          </button>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : 'closed'}`}>
        <div className="mobile-menu-content">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className={`mobile-menu-link ${activeSection === link.id ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {link.name}
            </a>
          ))}
          
          {/* Mobile Login Button */}
          <button 
            onClick={handleLogin}
            className="mobile-menu-login-btn"
            aria-label="Login"
          >
            <LogIn size={20} />
            <span>Login</span>
          </button>
        </div>
      </div>
    </nav>
  );
});

export default Navigation;