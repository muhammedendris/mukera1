import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, applicationsAPI, advisorsAPI } from '../services/api';
import './AdminDashboard.css';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Helper functions
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (fullName) => {
    if (!fullName) return '#0060AA';
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#0060AA', '#28A745', '#17A2B8', '#6C757D', '#FFC107', '#DC3545'];
    return colors[hash % colors.length];
  };

  const getPendingDeansStats = () => {
    const total = pendingDeans.length;
    const thisWeek = pendingDeans.filter(dean => {
      const created = new Date(dean.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length;
    return { total, thisWeek };
  };

  const getApplicationsStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    return { total, pending, accepted, rejected };
  };

  const getAdvisorsStats = () => {
    const total = advisors.length;
    const withAssignments = advisors.filter(adv => adv.assignedApplications && adv.assignedApplications.length > 0).length;
    return { total, withAssignments };
  };

  const filterBySearch = (items, searchFields) => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(query);
      })
    );
  };

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
      <div className="container dashboard-container">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user.fullName}</p>

        {message && <div className="alert alert-success">{message}</div>}

        {/* Tab Navigation */}
        <div style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('deans')}
            style={{
              padding: '12px 24px',
              marginRight: '10px',
              border: 'none',
              borderBottom: activeTab === 'deans' ? '3px solid #0060AA' : 'none',
              background: 'transparent',
              color: activeTab === 'deans' ? '#0060AA' : '#666',
              fontWeight: activeTab === 'deans' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Pending Deans ({pendingDeans.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '12px 24px',
              marginRight: '10px',
              border: 'none',
              borderBottom: activeTab === 'applications' ? '3px solid #0060AA' : 'none',
              background: 'transparent',
              color: activeTab === 'applications' ? '#0060AA' : '#666',
              fontWeight: activeTab === 'applications' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('advisors')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'advisors' ? '3px solid #0060AA' : 'none',
              background: 'transparent',
              color: activeTab === 'advisors' ? '#0060AA' : '#666',
              fontWeight: activeTab === 'advisors' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Manage Advisors ({advisors.length})
          </button>
        </div>

        {/* Pending Deans Tab */}
        {activeTab === 'deans' && (
          <>
            {/* Summary Cards */}
            <div className="evaluations-summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="eval-summary-card">
                <div className="eval-card-icon">
                  👥
                </div>
                <div className="eval-card-label">Total Pending</div>
                <div className="eval-card-value">{getPendingDeansStats().total}</div>
                <div className="eval-card-sublabel">Deans Awaiting Verification</div>
              </div>

              <div className="eval-summary-card">
                <div className="eval-card-icon success">
                  📊
                </div>
                <div className="eval-card-label">This Week</div>
                <div className="eval-card-value">{getPendingDeansStats().thisWeek}</div>
                <div className="eval-card-sublabel">New Registrations</div>
              </div>
            </div>

            {/* Premium Table */}
            <div className="premium-evaluations-table">
              {/* Header with Search */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E8ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  Pending Dean Verifications
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
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>Loading...</p>
                </div>
              ) : filterBySearch(pendingDeans, ['fullName', 'email']).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>{searchQuery.trim() ? 'No deans match your search.' : 'No pending dean verifications.'}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Dean</th>
                        <th>University</th>
                        <th>Department</th>
                        <th>Registration Date</th>
                        <th>ID Card</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterBySearch(pendingDeans, ['fullName', 'email']).map((dean) => (
                        <tr key={dean._id}>
                          {/* Dean Column with Avatar */}
                          <td>
                            <div className="student-cell">
                              <div
                                className="student-avatar"
                                style={{ background: getAvatarColor(dean.fullName) }}
                              >
                                {getInitials(dean.fullName)}
                              </div>
                              <div className="student-info">
                                <div className="student-name">{dean.fullName}</div>
                                <div className="student-email">{dean.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{dean.university}</td>
                          <td>{dean.department}</td>
                          <td>{new Date(dean.createdAt).toLocaleDateString()}</td>
                          <td>
                            {dean.idCardPath ? (
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => setSelectedIdCard(`${SERVER_URL}${dean.idCardPath}`)}
                              >
                                📄 View ID
                              </button>
                            ) : (
                              <span style={{ color: '#999' }}>No ID Card</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVerifyDean(dean._id, 'approve')}
                              style={{ marginRight: '8px' }}
                            >
                              ✓ Verify
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleVerifyDean(dean._id, 'reject')}
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
          </>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <>
            {/* Summary Cards */}
            <div className="evaluations-summary-grid">
              <div className="eval-summary-card">
                <div className="eval-card-icon">
                  📋
                </div>
                <div className="eval-card-label">Total Applications</div>
                <div className="eval-card-value">{getApplicationsStats().total}</div>
                <div className="eval-card-sublabel">All Submissions</div>
              </div>

              <div className="eval-summary-card">
                <div className="eval-card-icon warning">
                  ⏳
                </div>
                <div className="eval-card-label">Pending Review</div>
                <div className="eval-card-value">{getApplicationsStats().pending}</div>
                <div className="eval-card-sublabel">Awaiting Decision</div>
              </div>

              <div className="eval-summary-card">
                <div className="eval-card-icon success">
                  ✓
                </div>
                <div className="eval-card-label">Accepted</div>
                <div className="eval-card-value">{getApplicationsStats().accepted}</div>
                <div className="eval-card-sublabel">Approved Applications</div>
              </div>

              <div className="eval-summary-card">
                <div className="eval-card-icon danger">
                  ✕
                </div>
                <div className="eval-card-label">Rejected</div>
                <div className="eval-card-value">{getApplicationsStats().rejected}</div>
                <div className="eval-card-sublabel">Declined Applications</div>
              </div>
            </div>

            {/* Premium Table */}
            <div className="premium-evaluations-table">
              {/* Header with Search */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E8ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  Student Applications
                </h2>
                <input
                  type="text"
                  placeholder="Search by student name..."
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
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>Loading...</p>
                </div>
              ) : filterBySearch(applications, ['student.fullName', 'student.email']).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>{searchQuery.trim() ? 'No applications match your search.' : 'No applications yet.'}</p>
                </div>
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
                      {filterBySearch(applications, ['student.fullName', 'student.email']).map((app) => (
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
                          <td>{app.student?.university || 'N/A'}</td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '700',
                              background: '#CCE0F5',
                              color: '#004D8C'
                            }}>
                              {app.requestedDuration}
                            </span>
                          </td>
                          <td>
                            <span className={`eval-status-badge ${app.status}`}>
                              {app.status === 'accepted' && '✓ Accepted'}
                              {app.status === 'rejected' && '✕ Rejected'}
                              {app.status === 'pending' && '⏳ Pending'}
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
                              📄 View
                            </button>
                          </td>
                          <td>
                            {app.status === 'pending' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleAcceptApplication(app._id)}
                                  style={{ marginRight: '8px' }}
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRejectApplication(app._id)}
                                >
                                  ✕ Reject
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
                                  style={{ fontSize: '13px', padding: '6px' }}
                                >
                                  <option value="">Assign Advisor</option>
                                  {advisors.map((advisor) => (
                                    <option key={advisor._id} value={advisor._id}>
                                      {advisor.fullName}
                                    </option>
                                  ))}
                                </select>
                                {app.assignedAdvisor && (
                                  <small style={{ color: '#6B7280', fontSize: '11px', display: 'block', marginTop: '4px' }}>
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
          </>
        )}

        {/* Advisors Tab */}
        {activeTab === 'advisors' && (
          <>
            {/* Summary Cards */}
            <div className="evaluations-summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="eval-summary-card">
                <div className="eval-card-icon info">
                  👨‍🏫
                </div>
                <div className="eval-card-label">Total Advisors</div>
                <div className="eval-card-value">{getAdvisorsStats().total}</div>
                <div className="eval-card-sublabel">Registered Advisors</div>
              </div>

              <div className="eval-summary-card">
                <div className="eval-card-icon success">
                  📚
                </div>
                <div className="eval-card-label">Active Advisors</div>
                <div className="eval-card-value">{getAdvisorsStats().withAssignments}</div>
                <div className="eval-card-sublabel">With Assignments</div>
              </div>
            </div>

            {/* Create Advisor Form in Premium Card */}
            <div className="premium-evaluations-table" style={{ marginBottom: '24px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E8ED' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  Create New Advisor
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
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
                  <button type="submit" className="btn btn-primary">
                    ✨ Create Advisor
                  </button>
                </form>
              </div>
            </div>

            {/* Advisors List Table */}
            <div className="premium-evaluations-table">
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E1E8ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1F2937' }}>
                  Advisors List
                </h2>
                <input
                  type="text"
                  placeholder="Search advisors..."
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

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>Loading...</p>
                </div>
              ) : filterBySearch(advisors, ['fullName', 'email']).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                  <p>{searchQuery.trim() ? 'No advisors match your search.' : 'No advisors yet.'}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Advisor</th>
                        <th>Phone</th>
                        <th>Assignments</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterBySearch(advisors, ['fullName', 'email']).map((advisor) => (
                        <tr key={advisor._id}>
                          <td>
                            <div className="student-cell">
                              <div
                                className="student-avatar"
                                style={{ background: getAvatarColor(advisor.fullName) }}
                              >
                                {getInitials(advisor.fullName)}
                              </div>
                              <div className="student-info">
                                <div className="student-name">{advisor.fullName}</div>
                                <div className="student-email">{advisor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{advisor.phone || 'N/A'}</td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '700',
                              background: '#CCE0F5',
                              color: '#004D8C'
                            }}>
                              {advisor.assignedApplications?.length || 0} Students
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteAdvisor(advisor._id)}
                            >
                              🗑️ Delete
                            </button>
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

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div
          className="premium-modal"
          onClick={() => setShowCoverLetterModal(false)}
        >
          <div
            className="premium-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCoverLetterModal(false)}
              className="premium-close-btn"
            >
              Close
            </button>

            <div className="premium-modal-header">
              <h2>Student Cover Letter</h2>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #dee2e6',
              lineHeight: '1.6',
              fontSize: '14px',
              maxHeight: '60vh'
            }}>
              {selectedCoverLetter}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div
          className="premium-modal"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="premium-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
          >
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="premium-close-btn"
            >
              Close
            </button>

            <div className="premium-modal-header">
              <h2 style={{ color: '#dc3545' }}>Reject Application</h2>
              <p>Please provide a reason for rejecting this application. This will be sent to the student via email.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1F2937' }}>
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
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E1E8ED',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '100px',
                  outline: 'none'
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
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
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
                  borderRadius: '8px',
                  cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600'
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
          className="premium-modal"
          onClick={() => setSelectedIdCard(null)}
        >
          <div
            className="premium-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedIdCard(null)}
              className="premium-close-btn"
            >
              Close
            </button>

            <div className="premium-modal-header">
              <h2>Dean ID Card</h2>
            </div>

            <div style={{ textAlign: 'center' }}>
              <img
                src={selectedIdCard}
                alt="ID Card"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<p style="color: #dc3545; padding: 20px;">Failed to load image. Please check if the file exists on the server.</p>';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
