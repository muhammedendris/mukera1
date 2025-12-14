import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, reportsAPI } from '../services/api';
import Chat from './Chat';
import EvaluationForm from './EvaluationForm';
import ProgressBar from './ProgressBar';

const AdvisorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const response = await applicationsAPI.getAll();
      setStudents(response.data.applications);
    } catch (error) {
      console.error('Failed to load students:', error);
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Advisor Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.fullName}</p>

        <div className="advisor-layout">
          {/* Students List */}
          <div className="advisor-sidebar">
            <div className="card">
              <h3>Your Students</h3>
              {students.length === 0 ? (
                <p>No students assigned yet.</p>
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
              <div className="card">
                <p>Select a student from the list to view details</p>
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
                    onClick={() => setShowEvaluationForm(!showEvaluationForm)}
                  >
                    {showEvaluationForm ? 'Hide Evaluation Form' : 'Submit Evaluation'}
                  </button>
                </div>

                {/* Student Progress */}
                <ProgressBar
                  currentProgress={selectedStudent.currentProgress || 0}
                  internshipDurationWeeks={selectedStudent.internshipDurationWeeks || 0}
                  reportsSubmitted={reports.length}
                />

                {/* Evaluation Form */}
                {showEvaluationForm && (
                  <div className="card mt-2">
                    <EvaluationForm
                      applicationId={selectedStudent._id}
                      studentId={selectedStudent.student._id}
                      onSuccess={() => {
                        setShowEvaluationForm(false);
                        alert('Evaluation submitted successfully');
                      }}
                    />
                  </div>
                )}

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
