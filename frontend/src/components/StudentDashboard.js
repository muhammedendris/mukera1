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

  const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

  // Handle file download using backend proxy (avoids CORS/auth issues with Cloudinary)
  const handleDownload = async (type, id, fallbackUrl = null) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please login to download files');
        return;
      }

      // Use backend proxy endpoint
      const downloadUrl = `${API_URL}/download/${type}/${id}`;

      console.log('Downloading from:', downloadUrl);

      // Fetch the file with authentication
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
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
                background: 'linear-gradient(135deg, #EBF5FF 0%, #CCE0F5 100%)',
                border: '1px solid #99C2E8',
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
                    background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    📄
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#004D8C', fontSize: '1rem' }}>
                      Acceptance Letter from Dean
                    </h4>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>
                      Your department dean has attached an acceptance letter for you
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload('acceptance-letter', user._id)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(0, 96, 170, 0.25)',
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
                    onClick={() => handleDownload('attachment', application._id)}
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
              <div className="card-icon-wrapper info" style={{ background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)' }}>
                <span className="card-icon">📄</span>
              </div>
              <h3>Acceptance Letter</h3>
              <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                Your department dean has attached an acceptance letter for you
              </p>
              <button
                onClick={() => handleDownload('acceptance-letter', user._id)}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                  boxShadow: '0 4px 14px rgba(0, 96, 170, 0.25)'
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
                onClick={() => handleDownload('attachment', application._id)}
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
            <div className="card card-highlight" style={{ gridColumn: '1 / -1' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                margin: '-20px -20px 20px -20px',
                padding: '24px',
                borderRadius: '12px 12px 0 0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                    Final Evaluation Results
                  </h3>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                    Submitted by your advisor
                  </p>
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  border: '4px solid rgba(255,255,255,0.4)'
                }}>
                  {evaluation.grade}
                </div>
              </div>

              {/* Performance Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {/* Overall Performance */}
                <div style={{
                  background: 'linear-gradient(135deg, #EBF5FF 0%, #CCE0F5 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #99C2E8'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0060AA' }}>
                    {evaluation.overallPerformance}
                  </div>
                  <div style={{ color: '#004D8C', fontWeight: '600' }}>Overall Score</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>out of 100</div>
                </div>

                {/* Recommendation */}
                <div style={{
                  background: evaluation.recommendation === 'Highly Recommended'
                    ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
                    : evaluation.recommendation === 'Recommended'
                    ? 'linear-gradient(135deg, #EBF5FF 0%, #CCE0F5 100%)'
                    : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: evaluation.recommendation === 'Highly Recommended'
                    ? '1px solid #6EE7B7'
                    : evaluation.recommendation === 'Recommended'
                    ? '1px solid #99C2E8'
                    : '1px solid #FCD34D'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {evaluation.recommendation === 'Highly Recommended' ? '🌟' :
                     evaluation.recommendation === 'Recommended' ? '✓' : '📋'}
                  </div>
                  <div style={{
                    fontWeight: '700',
                    color: evaluation.recommendation === 'Highly Recommended' ? '#059669' :
                           evaluation.recommendation === 'Recommended' ? '#0060AA' : '#D97706'
                  }}>
                    {evaluation.recommendation}
                  </div>
                </div>
              </div>

              {/* Skills Assessment */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1F2937', fontSize: '1.1rem' }}>
                  Skills Assessment
                </h4>
                {[
                  { label: 'Technical Skills', value: evaluation.technicalSkills, icon: '💻' },
                  { label: 'Communication', value: evaluation.communication, icon: '💬' },
                  { label: 'Professionalism', value: evaluation.professionalism, icon: '👔' },
                  { label: 'Problem Solving', value: evaluation.problemSolving, icon: '🧩' }
                ].map((skill) => (
                  <div key={skill.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <span>{skill.icon}</span> {skill.label}
                      </span>
                      <span style={{ fontWeight: '700', color: '#0060AA' }}>{skill.value}/100</span>
                    </div>
                    <div style={{
                      height: '10px',
                      background: '#E5E7EB',
                      borderRadius: '5px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${skill.value}%`,
                        background: skill.value >= 80 ? 'linear-gradient(90deg, #059669, #10B981)' :
                                   skill.value >= 60 ? 'linear-gradient(90deg, #0060AA, #3B82F6)' :
                                   'linear-gradient(90deg, #F59E0B, #FBBF24)',
                        borderRadius: '5px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments Section */}
              {evaluation.comments && (
                <div style={{
                  background: '#F9FAFB',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #0060AA'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.95rem' }}>
                    Advisor Comments
                  </h4>
                  <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.6' }}>
                    {evaluation.comments}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {evaluation.strengths && (
                <div style={{
                  background: '#F0FDF4',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #22C55E'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '0.95rem' }}>
                    Strengths
                  </h4>
                  <p style={{ margin: 0, color: '#15803D', lineHeight: '1.6' }}>
                    {evaluation.strengths}
                  </p>
                </div>
              )}

              {/* Areas for Improvement */}
              {evaluation.areasForImprovement && (
                <div style={{
                  background: '#FFFBEB',
                  padding: '16px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #F59E0B'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#92400E', fontSize: '0.95rem' }}>
                    Areas for Improvement
                  </h4>
                  <p style={{ margin: 0, color: '#B45309', lineHeight: '1.6' }}>
                    {evaluation.areasForImprovement}
                  </p>
                </div>
              )}
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
