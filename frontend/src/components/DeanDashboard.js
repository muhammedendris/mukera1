import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, evaluationsAPI, applicationsAPI } from '../services/api';
import axios from 'axios';

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

  const SERVER_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

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
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/applications/accepted-students`,
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
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

        {/* PENDING STUDENTS TAB */}
        {activeTab === 'pending' && (
          <div className="card">
            <h2>Pending Student Verifications</h2>
            {pendingStudents.length === 0 ? (
              <p>No pending student verifications.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>University</th>
                      <th>Department</th>
                      <th>Registration Date</th>
                      <th>ID Card</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingStudents.map((student) => (
                      <tr key={student._id}>
                        <td>{student.fullName}</td>
                        <td>{student.email}</td>
                        <td>{student.university}</td>
                        <td>{student.department}</td>
                        <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td>
                          {student.idCardPath ? (
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => setSelectedIdCard(`${SERVER_URL}${student.idCardPath}`)}
                            >
                              View ID Card
                            </button>
                          ) : (
                            <span>No ID Card</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleVerify(student._id, 'approve')}
                            style={{ marginRight: '10px' }}
                          >
                            Verify
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleVerify(student._id, 'reject')}
                          >
                            Reject
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

        {/* ACCEPTED STUDENTS TAB */}
        {activeTab === 'accepted' && (
          <div className="card">
            <h2>Accepted Students</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Students who have been accepted for internships by the Admin
            </p>
            {acceptedStudents.length === 0 ? (
              <p>No accepted students yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Company Name</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Accepted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acceptedStudents.map((app) => (
                      <tr key={app._id}>
                        <td>{app.student?._id?.substring(0, 8)}...</td>
                        <td>
                          <strong>{app.student?.fullName}</strong>
                          <br />
                          <small style={{ color: '#666' }}>{app.student?.email}</small>
                        </td>
                        <td>{app.student?.department}</td>
                        <td>
                          {app.companyName || (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>Not Assigned</span>
                          )}
                        </td>
                        <td>{app.requestedDuration}</td>
                        <td>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#d4edda',
                            color: '#155724'
                          }}>
                            ✓ Accepted
                          </span>
                        </td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EVALUATIONS TAB */}
        {activeTab === 'evaluations' && (
          <div className="card">
            <h2>Student Evaluations</h2>
            {verifiedStudents.length === 0 ? (
              <p>No verified students with internships yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th>Advisor</th>
                      <th>Evaluation Status</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedStudents.map((item) => (
                      <tr key={item.student._id}>
                        <td>{item.student.fullName}</td>
                        <td>{item.student.email}</td>
                        <td>{item.application.companyName}</td>
                        <td>
                          {item.application.advisor
                            ? item.application.advisor.fullName
                            : 'Not Assigned'}
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: item.evaluation ? '#d4edda' : '#fff3cd',
                            color: item.evaluation ? '#155724' : '#856404'
                          }}>
                            {item.evaluation ? '\u2713 Evaluated' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {item.evaluation ? (
                            <strong style={{ color: '#667eea' }}>{item.evaluation.grade}</strong>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
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
                            <span style={{ color: '#999', fontSize: '12px' }}>
                              No evaluation submitted
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

      {/* Evaluation Details Modal */}
      {selectedStudent && selectedStudent.evaluation && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedStudent(null)}
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
            zIndex: 1000,
            overflowY: 'auto'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              margin: '20px'
            }}
          >
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Close
            </button>

            <h2 style={{ marginBottom: '10px', color: '#667eea' }}>
              Evaluation Details
            </h2>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              Student: <strong>{selectedStudent.student.fullName}</strong> |
              Company: <strong>{selectedStudent.application.companyName}</strong>
            </p>

            {/* Grade and Overall Performance */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Final Grade</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: 'bold' }}>
                  {selectedStudent.evaluation.grade}
                </p>
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
                  Overall Performance
                </h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: 'bold', color: '#667eea' }}>
                  {selectedStudent.evaluation.overallPerformance}/100
                </p>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>Skill Assessment</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { label: 'Technical Skills', value: selectedStudent.evaluation.technicalSkills },
                  { label: 'Communication', value: selectedStudent.evaluation.communication },
                  { label: 'Professionalism', value: selectedStudent.evaluation.professionalism },
                  { label: 'Problem Solving', value: selectedStudent.evaluation.problemSolving }
                ].map((skill) => (
                  <div key={skill.label}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '5px'
                    }}>
                      <span style={{ fontWeight: '500', color: '#555' }}>{skill.label}</span>
                      <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                        {skill.value}/100
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${skill.value}%`,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div style={{
              background: '#f8f9fa',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #667eea'
            }}>
              <strong style={{ color: '#333' }}>Recommendation:</strong>{' '}
              <span style={{ color: '#667eea', fontWeight: '600' }}>
                {selectedStudent.evaluation.recommendation}
              </span>
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Advisor Comments</h4>
              <p style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                {selectedStudent.evaluation.comments}
              </p>
            </div>

            {/* Strengths */}
            {selectedStudent.evaluation.strengths && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#28a745', marginBottom: '10px' }}>Strengths</h4>
                <p style={{
                  background: '#d4edda',
                  padding: '15px',
                  borderRadius: '8px',
                  lineHeight: '1.6',
                  color: '#155724'
                }}>
                  {selectedStudent.evaluation.strengths}
                </p>
              </div>
            )}

            {/* Areas for Improvement */}
            {selectedStudent.evaluation.areasForImprovement && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#ffc107', marginBottom: '10px' }}>Areas for Improvement</h4>
                <p style={{
                  background: '#fff3cd',
                  padding: '15px',
                  borderRadius: '8px',
                  lineHeight: '1.6',
                  color: '#856404'
                }}>
                  {selectedStudent.evaluation.areasForImprovement}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div style={{
              borderTop: '1px solid #e9ecef',
              paddingTop: '15px',
              fontSize: '13px',
              color: '#666'
            }}>
              <p style={{ margin: '5px 0' }}>
                <strong>Evaluated by:</strong> {selectedStudent.evaluation.advisor?.fullName || 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Submission Date:</strong>{' '}
                {new Date(selectedStudent.evaluation.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeanDashboard;
