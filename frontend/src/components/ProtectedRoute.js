import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="alert alert-error">
            <h2>Access Denied</h2>
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
