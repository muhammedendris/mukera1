import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import '../App.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Internship Portal
          </Link>

          <div className="navbar-menu">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
                <ThemeToggle />
                <Link to="/login" className="btn btn-outline nav-btn">Login</Link>
                <Link to="/register" className="btn btn-primary nav-btn">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
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
