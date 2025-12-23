import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="dashboard">
        <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#0060AA',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '20px', color: '#6B7280', fontSize: '16px' }}>
            Verifying authentication...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="dashboard">
        <div className="container" style={{ paddingTop: '120px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', color: '#DC3545' }}>
              🚫
            </div>
            <h2 style={{ marginBottom: '16px', color: '#DC3545' }}>Access Denied</h2>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>
              You do not have permission to access this page.
            </p>
            <a href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
