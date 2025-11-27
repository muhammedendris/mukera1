import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const DeanDashboard = () => {
  const { user } = useAuth();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState(null);

  const SERVER_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  useEffect(() => {
    loadPendingStudents();
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Dean Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.fullName}</p>

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        <div className="card">
          <h2>Pending Student Verifications</h2>
          <p>University: {user.university} | Department: {user.department}</p>

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
    </div>
  );
};

export default DeanDashboard;
