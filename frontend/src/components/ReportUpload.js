import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

const ReportUpload = ({ applicationId }) => {
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    weekNumber: '',
    title: '',
    description: '',
    reportFile: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [applicationId]);

  const loadReports = async () => {
    try {
      const response = await reportsAPI.getByApplication(applicationId);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'reportFile') {
      setFormData({
        ...formData,
        reportFile: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.reportFile) {
      setError('Please select a file to upload');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('applicationId', applicationId);
    data.append('weekNumber', formData.weekNumber);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('reportFile', formData.reportFile);

    try {
      await reportsAPI.upload(data);
      setSuccess('Report uploaded successfully');
      setFormData({ weekNumber: '', title: '', description: '', reportFile: null });
      document.getElementById('reportFile').value = '';
      loadReports();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Upload Form */}
      <div className="report-upload-form">
        <h4>Upload New Report</h4>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weekNumber">Week Number *</label>
              <input
                type="number"
                id="weekNumber"
                name="weekNumber"
                className="form-control"
                value={formData.weekNumber}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Report Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description * (min 50 characters)</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="reportFile">Report File * (PDF or DOCX)</label>
            <input
              type="file"
              id="reportFile"
              name="reportFile"
              className="form-control"
              onChange={handleChange}
              accept=".pdf,.doc,.docx"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="reports-list mt-3">
        <h4>Submitted Reports</h4>
        {reports.length === 0 ? (
          <p>No reports uploaded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Title</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>Week {report.weekNumber}</td>
                    <td>{report.title}</td>
                    <td>{new Date(report.uploadDate).toLocaleDateString()}</td>
                    <td>
                      {report.reviewed ? (
                        <span className="status-badge status-accepted">Reviewed</span>
                      ) : (
                        <span className="status-badge status-pending">Pending</span>
                      )}
                    </td>
                    <td>{report.advisorFeedback || 'No feedback yet'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportUpload;
