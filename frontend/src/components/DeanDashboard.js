import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, evaluationsAPI, applicationsAPI } from '../services/api';
import axios from 'axios';
import './DeanDashboard.css';

// Circular Progress Component for Overall Performance
const CircularProgress = ({ value, max = 100 }) => {
  const percentage = (value / max) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress">
      <svg width="160" height="160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#0060AA"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="circular-progress-text">
        <div className="circular-progress-value">{value}</div>
        <div className="circular-progress-max">/ {max}</div>
      </div>
    </div>
  );
};

const DeanDashboard = () => {
  const { user } = useAuth();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedStudentForRejection, setSelectedStudentForRejection] = useState(null);

  const SERVER_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://internship-api-cea6.onrender.com';

  useEffect(() => {
    loadPendingStudents();
    loadVerifiedStudentsWithEvaluations();
    loadAcceptedStudents();
  }, []);

  const loadPendingStudents = async () => {
    try {
      const response = await usersAPI.getPendingStudents();
      setPendingStudents(response.data.students);
    } catch (error) {
      console.error('Failed to load pending students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerifiedStudentsWithEvaluations = async () => {
    try {
      // Fetch all applications
      const appsResponse = await applicationsAPI.getAll();
      const acceptedApps = appsResponse.data.applications.filter(
        app => app.status === 'accepted' &&
               app.student.university === user.university &&
               app.student.department === user.department
      );

      // Fetch evaluations for each student
      const studentsWithEvals = await Promise.all(
        acceptedApps.map(async (app) => {
          try {
            const evalResponse = await evaluationsAPI.getByApplication(app._id);
            return {
              student: app.student,
              application: app,
              evaluation: evalResponse.data.evaluation
            };
          } catch (error) {
            // No evaluation yet for this student
            return {
              student: app.student,
              application: app,
              evaluation: null
            };
          }
        })
      );

      setVerifiedStudents(studentsWithEvals);
    } catch (error) {
      console.error('Failed to load verified students:', error);
    }
  };

  const loadAcceptedStudents = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api'}/applications/accepted-students`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setAcceptedStudents(response.data.students);
    } catch (error) {
      console.error('Failed to load accepted students:', error);
      setMessage(error.response?.data?.message || 'Failed to load accepted students');
    }
  };

  const handleVerify = async (studentId, action) => {
    try {
      await usersAPI.verifyUser(studentId, action);
      setMessage(`Student ${action === 'approve' ? 'verified' : 'rejected'} successfully`);
      loadPendingStudents();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Action failed');
    }
  };

  const viewEvaluationDetails = (studentData) => {
    setSelectedStudent(studentData);
  };

  // Handle opening acceptance letter in new tab
  const handleViewLetter = (letterUrl) => {
    window.open(letterUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle approval with confirmation
  const handleApprove = async (studentId, studentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to APPROVE ${studentName}?\n\n` +
      `This will mark the student as verified.`
    );

    if (confirmed) {
      try {
        await usersAPI.verifyUser(studentId, 'approve');
        setMessage(`✅ Student approved: ${studentName}`);
        loadPendingStudents(); // Reload the list
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to approve student');
        setTimeout(() => setMessage(''), 5000);
      }
    }
  };

  // Handle rejection initiation
  const handleRejectInitiate = (student) => {
    setSelectedStudentForRejection(student);
    setShowRejectionModal(true);
  };

  // Handle rejection submission
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const student = selectedStudentForRejection;

    try {
      await usersAPI.verifyUser(student._id, 'reject');
      setMessage(`❌ Student rejected: ${student.fullName} - Reason: ${rejectionReason}`);
      loadPendingStudents(); // Reload the list

      // Clean up
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedStudentForRejection(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Failed to reject student: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle cancel rejection modal
  const handleCancelRejection = () => {
    setShowRejectionModal(false);
    setRejectionReason('');
    setSelectedStudentForRejection(null);
  };

  // Filter students by search query
  const filterStudents = (students) => {
    if (!searchQuery.trim()) return students;

    const query = searchQuery.toLowerCase();
    return students.filter(student =>
      student.fullName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  };

  // Calculate summary statistics for accepted students tab
  const getAcceptedStudentsStats = () => {
    const total = acceptedStudents.length;
    const thisWeek = acceptedStudents.filter(app => {
      const accepted = new Date(app.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return accepted >= weekAgo;
    }).length;

    const withCompany = acceptedStudents.filter(app => app.companyName).length;
    const avgDuration = acceptedStudents.length > 0
      ? Math.round(
          acceptedStudents.reduce((sum, app) => {
            const months = parseInt(app.requestedDuration) || 0;
            return sum + months;
          }, 0) / acceptedStudents.length
        )
      : 0;

    return { total, thisWeek, withCompany, avgDuration };
  };

  // Helper function for grade color coding
  const getGradeClass = (grade) => {
    if (grade === 'A' || grade === 'A-') return 'grade-a';
    if (grade === 'B+' || grade === 'B' || grade === 'B-') return 'grade-b';
    if (grade === 'C+' || grade === 'C' || grade === 'C-') return 'grade-c';
    if (grade === 'D') return 'grade-d';
    if (grade === 'F') return 'grade-f';
    return 'grade-b'; // Default to blue
  };

  // Calculate summary statistics for evaluations tab
  const getEvaluationStats = () => {
    const totalStudents = verifiedStudents.length;
    const completedEvals = verifiedStudents.filter(s => s.evaluation).length;
    const pendingEvals = totalStudents - completedEvals;

    // Convert letter grades to GPA
    const gradeMap = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0
    };

    const evaluatedStudents = verifiedStudents.filter(s => s.evaluation);
    const avgGradeNumeric = evaluatedStudents.length > 0
      ? evaluatedStudents.reduce((sum, s) => sum + (gradeMap[s.evaluation.grade] || 0), 0) / evaluatedStudents.length
      : 0;

    const avgGradeDisplay = avgGradeNumeric.toFixed(2);
    const completionRate = totalStudents > 0
      ? Math.round((completedEvals / totalStudents) * 100)
      : 0;

    return { totalStudents, completedEvals, pendingEvals, avgGradeDisplay, completionRate };
  };

  // Get student initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get avatar color based on name hash
  const getAvatarColor = (fullName) => {
    if (!fullName) return '#0060AA';
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#0060AA', '#28A745', '#17A2B8', '#6C757D', '#FFC107', '#DC3545'];
    return colors[hash % colors.length];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container dashboard-container">
        <h1>Dean Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.fullName}</p>
        <p>University: {user.university} | Department: {user.department}</p>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '12px 24px',
              marginRight: '10px',
              border: 'none',
              borderBottom: activeTab === 'pending' ? '3px solid #667eea' : 'none',
              background: 'transparent',
              color: activeTab === 'pending' ? '#667eea' : '#666',
              fontWeight: activeTab === 'pending' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Pending Verifications ({pendingStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            style={{
              padding: '12px 24px',
              marginRight: '10px',
              border: 'none',
              borderBottom: activeTab === 'accepted' ? '3px solid #667eea' : 'none',
              background: 'transparent',
              color: activeTab === 'accepted' ? '#667eea' : '#666',
              fontWeight: activeTab === 'accepted' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Accepted Students ({acceptedStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'evaluations' ? '3px solid #667eea' : 'none',
              background: 'transparent',
              color: activeTab === 'evaluations' ? '#667eea' : '#666',
              fontWeight: activeTab === 'evaluations' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Student Evaluations ({verifiedStudents.filter(s => s.evaluation).length})
          </button>
        </div>

        {/* PENDING VERIFICATIONS TAB - Acceptance Letters */}
        {activeTab === 'pending' && (
          <div className="premium-evaluations-table">
            {/* Header with Search Bar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E8ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                Pending Acceptance Letter Verifications
              </h2>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #E1E8ED',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '280px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Table Content */}
            {filterStudents(pendingStudents).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                <p>{searchQuery.trim() ? 'No students match your search.' : 'No pending students to verify.'}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>GPA</th>
                      <th>University</th>
                      <th>Department</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterStudents(pendingStudents).map((student) => (
                      <tr key={student._id}>
                        {/* Student Column with Avatar */}
                        <td>
                          <div className="student-cell">
                            <div
                              className="student-avatar"
                              style={{ background: getAvatarColor(student.fullName) }}
                            >
                              {getInitials(student.fullName)}
                            </div>
                            <div className="student-info">
                              <div className="student-name">{student.fullName}</div>
                              <div className="student-email">{student.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* GPA Column (Color-coded) */}
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '700',
                            background: student.gpa >= 3.5 ? '#D4EDDA' : '#CCE0F5',
                            color: student.gpa >= 3.5 ? '#155724' : '#004D8C'
                          }}>
                            {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                          </span>
                        </td>

                        {/* University */}
                        <td>{student.university || 'N/A'}</td>

                        {/* Department */}
                        <td>{student.department || 'N/A'}</td>

                        {/* Registration Date */}
                        <td>{new Date(student.createdAt).toLocaleDateString()}</td>

                        {/* Actions Column */}
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(student._id, student.fullName)}
                            style={{ marginRight: '8px' }}
                            title="Approve acceptance letter"
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRejectInitiate(student)}
                            title="Reject acceptance letter"
                          >
                            ✕ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ACCEPTED STUDENTS TAB - Premium Design */}
        {activeTab === 'accepted' && (
          <>
            {/* Summary Cards Section */}
            <div className="evaluations-summary-grid">
              {/* Total Accepted */}
              <div className="eval-summary-card">
                <div className="eval-card-icon">
                  👥
                </div>
                <div className="eval-card-label">Total Accepted</div>
                <div className="eval-card-value">{getAcceptedStudentsStats().total}</div>
                <div className="eval-card-sublabel">Students</div>
              </div>

              {/* This Week */}
              <div className="eval-summary-card">
                <div className="eval-card-icon success">
                  📊
                </div>
                <div className="eval-card-label">This Week</div>
                <div className="eval-card-value">{getAcceptedStudentsStats().thisWeek}</div>
                <div className="eval-card-sublabel">New Acceptances</div>
              </div>

              {/* Placed (With Company) */}
              <div className="eval-summary-card">
                <div className="eval-card-icon info">
                  🏢
                </div>
                <div className="eval-card-label">Placed</div>
                <div className="eval-card-value">{getAcceptedStudentsStats().withCompany}</div>
                <div className="eval-card-sublabel">With Companies</div>
              </div>

              {/* Average Duration */}
              <div className="eval-summary-card">
                <div className="eval-card-icon warning">
                  ⏱️
                </div>
                <div className="eval-card-label">Avg Duration</div>
                <div className="eval-card-value">{getAcceptedStudentsStats().avgDuration}</div>
                <div className="eval-card-sublabel">Months</div>
              </div>
            </div>

            {/* Premium Table */}
            <div className="premium-evaluations-table">
              {/* Header with Search Bar */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E8ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  Accepted Students
                </h2>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #E1E8ED',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '280px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Table Content */}
              {filterStudents(acceptedStudents.map(app => ({
                _id: app._id,
                fullName: app.student?.fullName || 'N/A',
                email: app.student?.email || 'N/A',
                ...app
              }))).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>{searchQuery.trim() ? 'No students match your search.' : 'No accepted students yet.'}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Department</th>
                        <th>Company</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterStudents(acceptedStudents.map(app => ({
                        _id: app._id,
                        fullName: app.student?.fullName || 'N/A',
                        email: app.student?.email || 'N/A',
                        ...app
                      }))).map((app) => (
                        <tr key={app._id}>
                          {/* Student Column with Avatar */}
                          <td>
                            <div className="student-cell">
                              <div
                                className="student-avatar"
                                style={{ background: getAvatarColor(app.student?.fullName || 'Unknown') }}
                              >
                                {getInitials(app.student?.fullName || 'Unknown')}
                              </div>
                              <div className="student-info">
                                <div className="student-name">{app.student?.fullName || 'N/A'}</div>
                                <div className="student-email">{app.student?.email || 'N/A'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td>{app.student?.department || 'N/A'}</td>

                          {/* Company */}
                          <td>
                            {app.companyName ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>🏢</span>
                                <strong>{app.companyName}</strong>
                              </div>
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>Not Assigned</span>
                            )}
                          </td>

                          {/* Duration */}
                          <td>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: '#CCE0F5',
                              color: '#004D8C'
                            }}>
                              {app.requestedDuration}
                            </span>
                          </td>

                          {/* Status */}
                          <td>
                            <span className="eval-status-badge completed">
                              ✓ Accepted
                            </span>
                          </td>

                          {/* Actions */}
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => alert(`View details for ${app.student?.fullName}\n\nCompany: ${app.companyName || 'Not Assigned'}\nDuration: ${app.requestedDuration}\nAccepted: ${new Date(app.createdAt).toLocaleDateString()}`)}
                              style={{ marginRight: '8px' }}
                              title="View student details"
                            >
                              👁️ View
                            </button>
                            {app.student?.email && (
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => window.location.href = `mailto:${app.student.email}`}
                                title="Send email to student"
                              >
                                ✉️ Contact
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

        {/* EVALUATIONS TAB */}
        {activeTab === 'evaluations' && (
          <>
            {/* Summary Cards Section */}
            <div className="evaluations-summary-grid">
              {/* Total Students */}
              <div className="eval-summary-card">
                <div className="eval-card-icon">
                  👥
                </div>
                <div className="eval-card-label">Total Students</div>
                <div className="eval-card-value">{getEvaluationStats().totalStudents}</div>
                <div className="eval-card-sublabel">In Internship Program</div>
              </div>

              {/* Pending Evaluations */}
              <div className="eval-summary-card">
                <div className="eval-card-icon warning">
                  ⏳
                </div>
                <div className="eval-card-label">Pending Evaluations</div>
                <div className="eval-card-value">{getEvaluationStats().pendingEvals}</div>
                <div className="eval-card-sublabel">Awaiting Submission</div>
              </div>

              {/* Completed Evaluations */}
              <div className="eval-summary-card">
                <div className="eval-card-icon success">
                  ✓
                </div>
                <div className="eval-card-label">Completed</div>
                <div className="eval-card-value">{getEvaluationStats().completedEvals}</div>
                <div className="eval-card-sublabel">
                  {getEvaluationStats().completionRate}% Complete
                </div>
              </div>

              {/* Average Grade */}
              <div className="eval-summary-card">
                <div className="eval-card-icon info">
                  ⭐
                </div>
                <div className="eval-card-label">Average Grade</div>
                <div className="eval-card-value">{getEvaluationStats().avgGradeDisplay}</div>
                <div className="eval-card-sublabel">GPA Scale</div>
              </div>
            </div>

            {/* Premium Table */}
            <div className="premium-evaluations-table">
              {verifiedStudents.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>No verified students with internships yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Company</th>
                        <th>Advisor</th>
                        <th>Status</th>
                        <th>Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedStudents.map((item) => (
                        <tr key={item.student._id}>
                          <td>
                            <div className="student-cell">
                              <div
                                className="student-avatar"
                                style={{ background: getAvatarColor(item.student.fullName) }}
                              >
                                {getInitials(item.student.fullName)}
                              </div>
                              <div className="student-info">
                                <div className="student-name">{item.student.fullName}</div>
                                <div className="student-email">{item.student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{item.application.companyName}</td>
                          <td>
                            {item.application.advisor
                              ? item.application.advisor.fullName
                              : <span style={{ color: '#9CA3AF' }}>Not Assigned</span>}
                          </td>
                          <td>
                            <span className={`eval-status-badge ${item.evaluation ? 'completed' : 'pending'}`}>
                              {item.evaluation ? '✓ Evaluated' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>
                            {item.evaluation ? (
                              <span className="grade-display">{item.evaluation.grade}</span>
                            ) : (
                              <span className="grade-display no-grade">—</span>
                            )}
                          </td>
                          <td>
                            {item.evaluation ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => viewEvaluationDetails(item)}
                              >
                                View Details
                              </button>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic' }}>
                                No evaluation
                              </span>
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

      {/* ID Card Modal */}
      {selectedIdCard && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedIdCard(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90vh',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <button
              onClick={() => setSelectedIdCard(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
            <h3 style={{ marginBottom: '15px' }}>Student ID Card</h3>
            <img
              src={selectedIdCard}
              alt="Student ID Card"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML += '<p style="color: red;">Failed to load image. Please check if the file exists on the server.</p>';
              }}
            />
          </div>
        </div>
      )}

      {/* Premium Evaluation Details Modal */}
      {selectedStudent && selectedStudent.evaluation && (
        <div
          className="premium-evaluation-modal"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="premium-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedStudent(null)}
              className="premium-close-btn"
            >
              Close
            </button>

            {/* Header */}
            <div className="premium-modal-header">
              <h2>Evaluation Details</h2>
              <p>
                <strong>{selectedStudent.student.fullName}</strong> • {selectedStudent.application.companyName}
              </p>
            </div>

            {/* Top Summary Cards: Grade + Performance */}
            <div className="premium-summary-grid">
              {/* Final Grade Card with Color Coding */}
              <div className={`premium-grade-card ${getGradeClass(selectedStudent.evaluation.grade)}`}>
                <div className="grade-label">Final Grade</div>
                <div className="grade-value">{selectedStudent.evaluation.grade}</div>
                <div className="grade-sublabel">Academic Performance</div>
              </div>

              {/* Overall Performance Card with Circular Progress */}
              <div className="premium-performance-card">
                <h3>Overall Performance</h3>
                <CircularProgress
                  value={selectedStudent.evaluation.overallPerformance}
                  max={100}
                />
              </div>
            </div>

            {/* Skill Assessment Section with Icons */}
            <div className="premium-skills-section">
              <h3>Skill Assessment</h3>

              {[
                {
                  label: 'Technical Skills',
                  value: selectedStudent.evaluation.technicalSkills,
                  icon: '💻'
                },
                {
                  label: 'Communication',
                  value: selectedStudent.evaluation.communication,
                  icon: '💬'
                },
                {
                  label: 'Professionalism',
                  value: selectedStudent.evaluation.professionalism,
                  icon: '👔'
                },
                {
                  label: 'Problem Solving',
                  value: selectedStudent.evaluation.problemSolving,
                  icon: '🧩'
                }
              ].map((skill) => (
                <div key={skill.label} className="premium-skill-item">
                  <div className="skill-icon">{skill.icon}</div>
                  <div className="skill-info">
                    <div className="skill-label">
                      <span>{skill.label}</span>
                      <span>{skill.value}/100</span>
                    </div>
                    <div className="skill-progress-track">
                      <div
                        className="skill-progress-fill"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation Section */}
            <div className="premium-section">
              <div className="premium-section-title">Recommendation</div>
              <div className="premium-section-content">
                {selectedStudent.evaluation.recommendation}
              </div>
            </div>

            {/* Comments Section */}
            <div className="premium-section">
              <div className="premium-section-title">Advisor Comments</div>
              <div className="premium-section-content">
                {selectedStudent.evaluation.comments}
              </div>
            </div>

            {/* Strengths Section (Green border) */}
            {selectedStudent.evaluation.strengths && (
              <div className="premium-section" style={{ borderLeftColor: '#28A745' }}>
                <div className="premium-section-title">Strengths</div>
                <div className="premium-section-content">
                  {selectedStudent.evaluation.strengths}
                </div>
              </div>
            )}

            {/* Areas for Improvement Section (Yellow border) */}
            {selectedStudent.evaluation.areasForImprovement && (
              <div className="premium-section" style={{ borderLeftColor: '#FFC107' }}>
                <div className="premium-section-title">Areas for Improvement</div>
                <div className="premium-section-content">
                  {selectedStudent.evaluation.areasForImprovement}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="premium-metadata">
              <p>
                <strong>Evaluated by:</strong> {selectedStudent.evaluation.advisor?.fullName || 'N/A'}
              </p>
              <p>
                <strong>Submission Date:</strong>{' '}
                {new Date(selectedStudent.evaluation.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && selectedStudentForRejection && (
        <div
          className="modal-overlay"
          onClick={() => handleCancelRejection()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '600px',
              width: '90%',
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3 style={{ marginBottom: '20px', color: '#DC3545' }}>
              Reject Acceptance Letter
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Student:</strong> {selectedStudentForRejection.fullName}
              </p>
              <p style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Email:</strong> {selectedStudentForRejection.email}
              </p>
              <p style={{ margin: '8px 0', color: '#374151' }}>
                <strong>GPA:</strong> {selectedStudentForRejection.gpa ? selectedStudentForRejection.gpa.toFixed(2) : 'N/A'}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="rejectionReason" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1F2937' }}>
                Rejection Reason *
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this acceptance letter..."
                rows="5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E1E8ED',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                autoFocus
              />
              <small style={{ color: '#6B7280', fontSize: '12px' }}>
                {rejectionReason.length} characters
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleCancelRejection()}
                style={{
                  padding: '10px 20px',
                  background: '#6C757D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectSubmit()}
                style={{
                  padding: '10px 20px',
                  background: '#DC3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeanDashboard;
