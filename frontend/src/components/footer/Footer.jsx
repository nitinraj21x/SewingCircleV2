import React from 'react';
import { Facebook, Twitter, Linkedin, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = React.memo(() => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 className="footer-brand-title">The Sewing Circle</h3>
          <p className="footer-brand-subtitle">Weaving connections, one thread at a time</p>
        </div>
        
        <div className="footer-actions">
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="footer-social-link" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
          
          {/* Login Button */}
          <button 
            onClick={handleLogin}
            className="footer-login-btn"
            aria-label="Login"
          >
            <LogIn size={18} />
            <span>Login</span>
          </button>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="footer-copyright">
          © 2024 The Sewing Circle. All rights reserved.
        </p>
      </div>
    </footer>
  );
});

export default Footer;