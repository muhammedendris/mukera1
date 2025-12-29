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
                    <p>No reports submitted yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Week</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Feedback</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report) => (
                            <tr key={report._id}>
                              <td>Week {report.weekNumber}</td>
                              <td>{report.title}</td>
                              <td>{report.description}</td>
                              <td>{new Date(report.uploadDate).toLocaleDateString()}</td>
                              <td>{report.advisorFeedback || 'No feedback yet'}</td>
                              <td>
                                {!report.reviewed && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      const feedback = prompt('Enter your feedback:');
                                      if (feedback) handleAddFeedback(report._id, feedback);
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
