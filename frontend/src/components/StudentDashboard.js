import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, reportsAPI } from '../services/api';
import ApplicationForm from './ApplicationForm';
import Chat from './Chat';
import ReportUpload from './ReportUpload';
import ProgressBar from './ProgressBar';
import { evaluationsAPI } from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [reportsCount, setReportsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const SERVER_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://internship-api-cea6.onrender.com';

  // Helper to get file URL (handles both Cloudinary URLs and legacy local paths)
  const getFileUrl = (path) => {
    if (!path) return null;
    // If it's already a full URL (Cloudinary), return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Otherwise, prepend server URL for legacy local paths
    return `${SERVER_URL}${path}`;
  };

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const response = await applicationsAPI.getAll();
      if (response.data.applications && response.data.applications.length > 0) {
        const app = response.data.applications[0];
        setApplication(app);

        // Load evaluation if application is accepted
        if (app.status === 'accepted') {
          try {
            const evalResponse = await evaluationsAPI.getByApplication(app._id);
            setEvaluation(evalResponse.data.evaluation);
          } catch (error) {
            // No evaluation yet
          }

          // Load reports count
          try {
            const reportsResponse = await reportsAPI.getByApplication(app._id);
            setReportsCount(reportsResponse.data.count || 0);
          } catch (error) {
            // No reports yet
          }
        }
      }
    } catch (error) {
      console.error('Failed to load application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = () => {
    setShowApplicationForm(false);
    loadApplication();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Account not verified yet
  if (!user.isVerified) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="card">
            <h2>Account Pending Verification</h2>
            <p>
              Your account is waiting for verification by your Department Dean.
              Please check back later.
            </p>
            <div className="alert alert-info mt-2">
              <strong>University:</strong> {user.university}<br />
              <strong>Department:</strong> {user.department}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verified but no application yet
  if (!application && !showApplicationForm) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="card">
            <h2>Welcome, {user.fullName}!</h2>
            <p>Your account has been verified. You can now apply for an internship.</p>

            {/* Acceptance Letter Card */}
            {user.acceptanceLetterPath && (
              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '16px 20px',
                marginTop: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    📄
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#047857', fontSize: '1rem' }}>
                      Acceptance Letter from Dean
                    </h4>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>
                      Your department dean has attached an acceptance letter for you
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(getFileUrl(user.acceptanceLetterPath), '_blank', 'noopener,noreferrer')}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7,10 12,15 17,10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg mt-2"
              onClick={() => setShowApplicationForm(true)}
            >
              Apply for Internship
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show application form
  if (showApplicationForm) {
    return (
      <div className="dashboard">
        <div className="container">
          <ApplicationForm onSuccess={handleApplicationSubmit} />
          <button
            className="btn btn-secondary mt-2"
            onClick={() => setShowApplicationForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Application pending
  if (application.status === 'pending') {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="card">
            <h2>Application Submitted</h2>
            <p>Your application is being reviewed by the company admin.</p>
            <div className="application-details">
              <p><strong>Status:</strong> <span className="status-badge status-pending">Pending</span></p>
              <p><strong>Requested Duration:</strong> {application.requestedDuration}</p>
              <p><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleDateString()}</p>
            </div>

            {/* My Uploaded CV/Resume */}
            {application.attachmentPath && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#F0F9FF',
                borderRadius: '12px',
                border: '1px solid #BAE6FD'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>📎</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#0369A1' }}>My CV/Resume</h4>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>
                      The file you attached with your application
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(getFileUrl(application.attachmentPath), '_blank', 'noopener,noreferrer')}
                    className="btn btn-primary btn-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Application rejected
  if (application.status === 'rejected') {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="card">
            <h2>Application Status</h2>
            <div className="alert alert-error">
              <p><strong>Status:</strong> Rejected</p>
              {application.rejectionReason && (
                <p><strong>Reason:</strong> {application.rejectionReason}</p>
              )}
            </div>
            <p>You may apply again after addressing the feedback.</p>
          </div>
        </div>
      </div>
    );
  }

  // Application accepted - Show full dashboard
  return (
    <div className="dashboard">
      <div className="container dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user.fullName}</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Application Status Card */}
          <div className="card card-highlight">
            <div className="card-icon-wrapper success">
              <span className="card-icon">✓</span>
            </div>
            <h3>Application Status</h3>
            <p className="status-badge status-accepted">Accepted</p>
            <div className="mt-2">
              <p><strong>Duration:</strong> {application.requestedDuration}</p>
              <p><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Acceptance Letter Card */}
          {user.acceptanceLetterPath && (
            <div className="card card-highlight">
              <div className="card-icon-wrapper success">
                <span className="card-icon">📄</span>
              </div>
              <h3>Acceptance Letter</h3>
              <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                Your department dean has attached an acceptance letter for you
              </p>
              <button
                onClick={() => window.open(getFileUrl(user.acceptanceLetterPath), '_blank', 'noopener,noreferrer')}
                className="btn btn-success"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Letter
              </button>
            </div>
          )}

          {/* My Uploaded CV/Resume Card */}
          {application.attachmentPath && (
            <div className="card card-highlight">
              <div className="card-icon-wrapper info">
                <span className="card-icon">📎</span>
              </div>
              <h3>My CV/Resume</h3>
              <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                The file you attached with your application
              </p>
              <button
                onClick={() => window.open(getFileUrl(application.attachmentPath), '_blank', 'noopener,noreferrer')}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download My File
              </button>
            </div>
          )}

          {/* Advisor Card */}
          {application.assignedAdvisor && (
            <div className="card card-highlight">
              <div className="card-icon-wrapper info">
                <span className="card-icon">👤</span>
              </div>
              <h3>Your Advisor</h3>
              <p><strong>Name:</strong> {application.assignedAdvisor.fullName}</p>
              <p><strong>Email:</strong> {application.assignedAdvisor.email}</p>
            </div>
          )}

          {/* Evaluation Card */}
          {evaluation && (
            <div className="card card-highlight">
              <div className="card-icon-wrapper warning">
                <span className="card-icon">⭐</span>
              </div>
              <h3>Final Evaluation</h3>
              <p><strong>Grade:</strong> {evaluation.grade}</p>
              <p><strong>Overall Performance:</strong> {evaluation.overallPerformance}/100</p>
              <p><strong>Recommendation:</strong> {evaluation.recommendation}</p>
              <p><strong>Comments:</strong> {evaluation.comments}</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentProgress={application.currentProgress || 0}
          internshipDurationWeeks={application.internshipDurationWeeks || 0}
          reportsSubmitted={reportsCount}
        />

        {/* Chat Section */}
        <div className="card">
          <h3>
            {application.assignedAdvisor
              ? 'Chat with Advisor'
              : 'Messages (Advisor Not Yet Assigned)'}
          </h3>

          {!application.assignedAdvisor && (
            <div className="alert alert-info mb-2" style={{
              background: '#e7f3ff',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #b3d9ff'
            }}>
              <strong>📝 Note:</strong> You can start preparing your questions here.
              Once an advisor is assigned, they will receive all your messages.
            </div>
          )}

          <Chat
            applicationId={application._id}
            hasAdvisor={!!application.assignedAdvisor}
            advisorInfo={application.assignedAdvisor}
          />
        </div>

        {/* Report Upload Section */}
        <div className="card">
          <h3>Weekly Reports</h3>
          <ReportUpload applicationId={application._id} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
