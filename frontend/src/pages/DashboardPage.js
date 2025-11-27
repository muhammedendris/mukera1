import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/StudentDashboard';
import DeanDashboard from '../components/DeanDashboard';
import AdminDashboard from '../components/AdminDashboard';
import AdvisorDashboard from '../components/AdvisorDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'dean':
      return <DeanDashboard />;
    case 'company-admin':
      return <AdminDashboard />;
    case 'advisor':
      return <AdvisorDashboard />;
    default:
      return (
        <div className="dashboard">
          <div className="container">
            <div className="alert alert-error">
              Invalid user role. Please contact support.
            </div>
          </div>
        </div>
      );
  }
};

export default DashboardPage;
