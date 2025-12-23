import React, { useEffect, useState } from 'react';
import '../App.css';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!message) return;

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Match animation duration
  };

  if (!message || !isVisible) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className={`toast-container ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className={`toast ${isError ? 'toast-error' : ''} ${isSuccess ? 'toast-success' : ''}`}>
        <div className="toast-icon">
          {isError ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
        </div>
        <div className="toast-content">
          <p className="toast-message">{message}</p>
        </div>
        <button className="toast-close" onClick={handleClose} aria-label="Close notification">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="toast-progress">
          <div
            className="toast-progress-bar"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
