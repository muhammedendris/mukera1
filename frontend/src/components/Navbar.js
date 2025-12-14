import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import '../App.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Left Section - Brand + Auth Buttons (MOBILE ONLY) */}
          <div className="navbar-left">
            <div className="navbar-brand-wrapper">
              <img
                src="/favicon.jpg"
                alt="Internship Portal Logo"
                className="navbar-logo-image"
              />
              <Link to="/" className="navbar-brand">
                Internship Portal
              </Link>
            </div>
            {!isAuthenticated && (
              <div className="auth-buttons auth-buttons-left">
                <Link to="/login" className="btn btn-outline nav-btn" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary nav-btn" onClick={closeMobileMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Icon */}
          <button
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Right Section - Navigation Menu */}
          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {!isAuthenticated ? (
              <>
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
                <Link to="/about" className="nav-link" onClick={closeMobileMenu}>About</Link>
                <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
                {/* Auth buttons for DESKTOP (between Contact and Theme) */}
                <div className="auth-buttons auth-buttons-right">
                  <Link to="/login" className="btn btn-outline nav-btn" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary nav-btn" onClick={closeMobileMenu}>
                    Register
                  </Link>
                </div>
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                <span className="nav-link user-info">
                  Welcome, {user?.fullName}
                </span>
                <ThemeToggle />
                <button onClick={handleLogout} className="btn btn-secondary nav-btn">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
