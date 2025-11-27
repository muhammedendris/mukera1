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
        {application.assignedAdvisor && (
          <div className="card">
            <h3>Chat with Advisor</h3>
            <Chat applicationId={application._id} />
          </div>
        )}

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
