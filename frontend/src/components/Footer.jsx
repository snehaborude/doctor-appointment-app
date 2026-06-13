import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-slim">
      <div className="footer-inner">

        {/* Brand */}
        <Link to="/" className="footer-brand">
          <div className="footer-brand-icon">
            <Heart size={14} color="white" fill="white" />
          </div>
          Doc<span>Reserv</span>
        </Link>

        {/* Contact Links */}
        <div className="footer-contacts">
          <a href="mailto:support@docreserv.com" className="footer-contact-link">
            <Mail size={13} />
            support@docreserv.com
          </a>
          <span className="footer-divider-dot">·</span>
          <a href="tel:+919876543210" className="footer-contact-link">
            <Phone size={13} />
            +91 98765 43210
          </a>
          <span className="footer-divider-dot">·</span>
          <span className="footer-contact-link footer-location">
            <MapPin size={13} />
            Mumbai, India
          </span>
        </div>

        {/* Nav Links */}
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
        </nav>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} DocReserv. All rights reserved.</span>
        <div className="footer-bottom-links">
          <Link to="/about">Privacy Policy</Link>
          <Link to="/about">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
