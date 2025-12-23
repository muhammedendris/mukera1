import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/StudentDashboard';
import DeanDashboard from '../components/DeanDashboard';
import AdminDashboard from '../components/AdminDashboard';
import AdvisorDashboard from '../components/AdvisorDashboard';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while authentication is being verified
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
            Loading your dashboard...
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

  // If no user after loading completes, show message
  if (!user) {
    return (
      <div className="dashboard">
        <div className="container" style={{ paddingTop: '120px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ marginBottom: '16px' }}>Session Expired</h2>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>
              Your session has expired. Please log in again.
            </p>
            <a href="/login" className="btn btn-primary">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  // Support both 'admin' and 'company-admin' for AdminDashboard
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'dean':
      return <DeanDashboard />;
    case 'company-admin':
    case 'admin':
      return <AdminDashboard />;
    case 'advisor':
      return <AdvisorDashboard />;
    default:
      // Show detailed error for debugging
      return (
        <div className="dashboard">
          <div className="container" style={{ paddingTop: '120px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                color: '#DC3545'
              }}>
                ⚠️
              </div>
              <h2 style={{ marginBottom: '16px', color: '#DC3545' }}>
                Unknown User Role
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '10px' }}>
                Your account has an unrecognized role: <strong>"{user.role || 'undefined'}"</strong>
              </p>
              <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                Please contact support if this issue persists.
              </p>
              <div style={{
                background: '#F3F4F6',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '14px'
              }}>
                <strong>Debug Info:</strong><br />
                Email: {user.email || 'N/A'}<br />
                Name: {user.fullName || 'N/A'}<br />
                Role: {user.role || 'undefined'}<br />
                Verified: {user.isVerified ? 'Yes' : 'No'}
              </div>
              <a href="/login" className="btn btn-primary">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      );
  }
};

export default DashboardPage;
