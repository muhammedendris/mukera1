import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, reportsAPI } from '../services/api';
import Chat from './Chat';
import EvaluationForm from './EvaluationForm';
import ProgressBar from './ProgressBar';
import Modal from './Modal';

const AdvisorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SERVER_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://internship-api-cea6.onrender.com';

  const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

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

  // Handle file download using backend proxy (avoids CORS/auth issues with Cloudinary)
  const handleDownloadReport = async (reportId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please login to download files');
        return;
      }

      const downloadUrl = `${API_URL}/download/report/${reportId}`;
      console.log('Downloading report from:', downloadUrl);

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'report.pdf';
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
      alert('Failed to download report. Please try again.');
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadReports(selectedStudent._id);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      setError(null);
      const response = await applicationsAPI.getAll();
      setStudents(response.data.applications);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (applicationId) => {
    try {
      const response = await reportsAPI.getByApplication(applicationId);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleAddFeedback = async (reportId, feedback) => {
    try {
      await reportsAPI.addFeedback(reportId, feedback);
      loadReports(selectedStudent._id);
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container dashboard-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
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
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container dashboard-container">
        <h1>Advisor Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.fullName}</p>

        {/* Error Message Display */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
            <button
              onClick={loadStudents}
              style={{
                marginLeft: '15px',
                padding: '5px 12px',
                background: '#DC3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="advisor-layout">
          {/* Students List */}
          <div className="advisor-sidebar">
            <div className="card">
              <h3>Your Students</h3>
              {students.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>👨‍🎓</div>
                  <p style={{ marginBottom: '10px', fontWeight: '500' }}>No students assigned yet</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Students will appear here once they are assigned to you by the admin.
                  </p>
                </div>
              ) : (
                <div className="students-list">
                  {students.map((app) => (
                    <div
                      key={app._id}
                      className={`student-item ${selectedStudent?._id === app._id ? 'active' : ''}`}
                      onClick={() => setSelectedStudent(app)}
                    >
                      <h4>{app.student.fullName}</h4>
                      <p>{app.student.university}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Details */}
          <div className="advisor-main">
            {!selectedStudent ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                <h3 style={{ marginBottom: '10px', color: '#1F2937' }}>Student Details</h3>
                <p style={{ color: '#6B7280', marginBottom: '15px' }}>
                  {students.length > 0
                    ? 'Select a student from the sidebar to view their details, progress, and reports.'
                    : 'Your assigned students will appear in the sidebar on the left.'}
                </p>
                {students.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Contact your administrator if you expect to have students assigned.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Student Info Card */}
                <div className="card">
                  <h2>{selectedStudent.student.fullName}</h2>
                  <div className="student-details">
                    <p><strong>Email:</strong> {selectedStudent.student.email}</p>
                    <p><strong>University:</strong> {selectedStudent.student.university}</p>
                    <p><strong>Department:</strong> {selectedStudent.student.department}</p>
                    <p><strong>Duration:</strong> {selectedStudent.requestedDuration}</p>
                  </div>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowEvaluationForm(true)}
                  >
                    Submit Evaluation
                  </button>
                </div>

                {/* Student Progress */}
                <ProgressBar
                  currentProgress={selectedStudent.currentProgress || 0}
                  internshipDurationWeeks={selectedStudent.internshipDurationWeeks || 0}
                  reportsSubmitted={reports.length}
                />

                {/* Evaluation Form Modal */}
                <Modal
                  isOpen={showEvaluationForm}
                  onClose={() => setShowEvaluationForm(false)}
                  title={`Evaluate ${selectedStudent.student.fullName}`}
                  size="large"
                >
                  <EvaluationForm
                    applicationId={selectedStudent._id}
                    studentId={selectedStudent.student._id}
                    onSuccess={() => {
                      setShowEvaluationForm(false);
                    }}
                  />
                </Modal>

                {/* Chat */}
                <div className="card mt-2">
                  <h3>Chat with Student</h3>
                  <Chat
                    applicationId={selectedStudent._id}
                    hasAdvisor={true}
                    advisorInfo={user}
                  />
                </div>

                {/* Reports */}
                <div className="card mt-2">
                  <h3>Student Reports</h3>
                  {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                      <p style={{ fontWeight: '500' }}>No reports submitted yet</p>
                      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                        Weekly reports from this student will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Week</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>File</th>
                            <th>Feedback</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report) => (
                            <tr key={report._id}>
                              <td>
                                <span style={{
                                  background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                                  color: 'white',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}>
                                  Week {report.weekNumber}
                                </span>
                              </td>
                              <td style={{ fontWeight: '500' }}>{report.title}</td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {report.description}
                              </td>
                              <td>{new Date(report.uploadDate).toLocaleDateString()}</td>
                              <td>
                                {report.filePath ? (
                                  <button
                                    onClick={() => handleDownloadReport(report._id)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                      boxShadow: '0 2px 8px rgba(0, 96, 170, 0.25)',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    title="Download/View Report"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                      <polyline points="7,10 12,15 17,10"></polyline>
                                      <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download
                                  </button>
                                ) : (
                                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>No file</span>
                                )}
                              </td>
                              <td>
                                {report.advisorFeedback ? (
                                  <div style={{
                                    background: '#F0FDF4',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    borderLeft: '3px solid #22C55E',
                                    fontSize: '13px',
                                    maxWidth: '200px'
                                  }}>
                                    {report.advisorFeedback}
                                  </div>
                                ) : (
                                  <span style={{
                                    background: '#FEF3C7',
                                    color: '#92400E',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '12px'
                                  }}>
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td>
                                {!report.reviewed && (
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => {
                                      const feedback = prompt('Enter your feedback:');
                                      if (feedback) handleAddFeedback(report._id, feedback);
                                    }}
                                    style={{
                                      background: '#F3F4F6',
                                      color: '#374151',
                                      border: '1px solid #D1D5DB',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '500'
                                    }}
                                  >
                                    Add Feedback
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
