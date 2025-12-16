import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, applicationsAPI, advisorsAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deans');
  const [pendingDeans, setPendingDeans] = useState([]);
  const [applications, setApplications] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [newAdvisor, setNewAdvisor] = useState({
    email: '', password: '', fullName: '', phone: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIdCard, setSelectedIdCard] = useState(null);

  // Cover Letter Modal State
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const SERVER_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://internship-api-cea6.onrender.com';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'deans') {
        const response = await usersAPI.getPendingDeans();
        setPendingDeans(response.data.deans);
      } else if (activeTab === 'applications') {
        const response = await applicationsAPI.getAll();
        setApplications(response.data.applications);
        const advisorResponse = await advisorsAPI.getAll();
        setAdvisors(advisorResponse.data.advisors);
      } else if (activeTab === 'advisors') {
        const response = await advisorsAPI.getAll();
        setAdvisors(response.data.advisors);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDean = async (deanId, action) => {
    try {
      await usersAPI.verifyUser(deanId, action);
      showMessage(`Dean ${action === 'approve' ? 'verified' : 'rejected'} successfully`);
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Action failed');
    }
  };

  const handleAcceptApplication = async (appId) => {
    if (window.confirm('Are you sure you want to accept this application?')) {
      try {
        await applicationsAPI.updateStatus(appId, 'accepted');
        showMessage('Application accepted successfully. Email sent to student.');
        loadData();
      } catch (error) {
        showMessage(error.response?.data?.message || 'Action failed');
      }
    }
  };

  const handleRejectApplication = (appId) => {
    setSelectedApplicationId(appId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmRejectApplication = async () => {
    if (!rejectionReason.trim()) {
      showMessage('Please provide a rejection reason');
      return;
    }

    try {
      await applicationsAPI.updateStatus(selectedApplicationId, 'rejected', rejectionReason);
      showMessage('Application rejected successfully. Email sent to student.');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApplicationId(null);
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Action failed');
    }
  };

  const handleAssignAdvisor = async (appId, advisorId) => {
    try {
      await applicationsAPI.assignAdvisor(appId, advisorId);
      showMessage('Advisor assigned successfully');
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to assign advisor');
    }
  };

  const handleCreateAdvisor = async (e) => {
    e.preventDefault();
    try {
      await advisorsAPI.create(newAdvisor);
      showMessage('Advisor created successfully');
      setNewAdvisor({ email: '', password: '', fullName: '', phone: '' });
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to create advisor');
    }
  };

  const handleDeleteAdvisor = async (advisorId) => {
    if (window.confirm('Are you sure you want to delete this advisor?')) {
      try {
        await advisorsAPI.delete(advisorId);
        showMessage('Advisor deleted successfully');
        loadData();
      } catch (error) {
        showMessage(error.response?.data?.message || 'Failed to delete advisor');
      }
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.fullName}</p>

        {message && <div className="alert alert-success">{message}</div>}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'deans' ? 'active' : ''}`}
            onClick={() => setActiveTab('deans')}
          >
            Pending Deans
          </button>
          <button
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`tab-button ${activeTab === 'advisors' ? 'active' : ''}`}
            onClick={() => setActiveTab('advisors')}
          >
            Manage Advisors
          </button>
        </div>

        {/* Pending Deans Tab */}
        {activeTab === 'deans' && (
          <div className="card">
            <h2>Pending Dean Verifications</h2>
            {loading ? (
              <p>Loading...</p>
            ) : pendingDeans.length === 0 ? (
              <p>No pending dean verifications.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>University</th>
                      <th>Department</th>
                      <th>ID Card</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeans.map((dean) => (
                      <tr key={dean._id}>
                        <td>{dean.fullName}</td>
                        <td>{dean.email}</td>
                        <td>{dean.university}</td>
                        <td>{dean.department}</td>
                        <td>
                          {dean.idCardPath ? (
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => setSelectedIdCard(`${SERVER_URL}${dean.idCardPath}`)}
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
                            onClick={() => handleVerifyDean(dean._id, 'approve')}
                            style={{ marginRight: '10px' }}
                          >
                            Verify
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleVerifyDean(dean._id, 'reject')}
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

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="card">
            <h2>Student Applications</h2>
            {loading ? (
              <p>Loading...</p>
            ) : applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>University</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Cover Letter</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app._id}>
                        <td>{app.student?.fullName}</td>
                        <td>{app.student?.university}</td>
                        <td>{app.requestedDuration}</td>
                        <td>
                          <span className={`status-badge status-${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => {
                              setSelectedCoverLetter(app.coverLetter);
                              setShowCoverLetterModal(true);
                            }}
                          >
                            View Cover Letter
                          </button>
                        </td>
                        <td>
                          {app.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAcceptApplication(app._id)}
                                style={{ marginRight: '5px' }}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectApplication(app._id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === 'accepted' && (
                            <div>
                              <select
                                className="form-control"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignAdvisor(app._id, e.target.value);
                                  }
                                }}
                                value={app.assignedAdvisor?._id || ""}
                              >
                                <option value="">Select Advisor</option>
                                {advisors.map((advisor) => (
                                  <option key={advisor._id} value={advisor._id}>
                                    {advisor.fullName}
                                  </option>
                                ))}
                              </select>
                              {app.assignedAdvisor && (
                                <small className="text-muted d-block mt-1">
                                  Current: {app.assignedAdvisor.fullName}
                                </small>
                              )}
                            </div>
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

        {/* Advisors Tab */}
        {activeTab === 'advisors' && (
          <div className="card">
            <h2>Manage Advisors</h2>

            <div className="create-advisor-form">
              <h3>Create New Advisor</h3>
              <form onSubmit={handleCreateAdvisor}>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Full Name"
                      value={newAdvisor.fullName}
                      onChange={(e) => setNewAdvisor({ ...newAdvisor, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={newAdvisor.email}
                      onChange={(e) => setNewAdvisor({ ...newAdvisor, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={newAdvisor.password}
                      onChange={(e) => setNewAdvisor({ ...newAdvisor, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Phone"
                      value={newAdvisor.phone}
                      onChange={(e) => setNewAdvisor({ ...newAdvisor, phone: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Create Advisor</button>
              </form>
            </div>

            <h3 className="mt-3">All Advisors</h3>
            {loading ? (
              <p>Loading...</p>
            ) : advisors.length === 0 ? (
              <p>No advisors yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advisors.map((advisor) => (
                      <tr key={advisor._id}>
                        <td>{advisor.fullName}</td>
                        <td>{advisor.email}</td>
                        <td>{advisor.phone || 'N/A'}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteAdvisor(advisor._id)}
                          >
                            Delete
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
      </div>

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCoverLetterModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '500px',
              maxWidth: '800px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0060AA' }}>
              Student Cover Letter
            </h3>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid #dee2e6',
              lineHeight: '1.6',
              fontSize: '14px'
            }}>
              {selectedCoverLetter}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCoverLetterModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '500px',
              maxWidth: '600px'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#dc3545' }}>
              Reject Application
            </h3>

            <p style={{ marginBottom: '15px', color: '#666' }}>
              Please provide a reason for rejecting this application. This will be sent to the student via email.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Rejection Reason *
              </label>
              <textarea
                className="form-control"
                rows="5"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Example: We regret to inform you that your application did not meet our current requirements. We encourage you to gain more experience in relevant areas and apply again in the future."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmRejectApplication}
                disabled={!rejectionReason.trim()}
                style={{
                  padding: '10px 20px',
                  background: rejectionReason.trim() ? '#dc3545' : '#cccccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h3 style={{ marginBottom: '15px' }}>ID Card</h3>
            <img
              src={selectedIdCard}
              alt="ID Card"
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

export default AdminDashboard;
