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
  const [editingReport, setEditingReport] = useState(null); // Track if updating existing report
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

  // Check if report exists for the selected week
  const checkExistingReport = (weekNum) => {
    return reports.find(r => r.weekNumber === parseInt(weekNum));
  };

  // Load existing report data for editing
  const handleEditReport = (report) => {
    setEditingReport(report);
    setFormData({
      weekNumber: report.weekNumber,
      title: report.title,
      description: report.description,
      reportFile: null // File will be optional when updating
    });
    setError('');
    setSuccess('');

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReport(null);
    setFormData({ weekNumber: '', title: '', description: '', reportFile: null });
    document.getElementById('reportFile').value = '';
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if file is required
    if (!editingReport && !formData.reportFile) {
      setError('Please select a file to upload');
      return;
    }

    // Check for existing report only when creating new (not when updating)
    if (!editingReport) {
      const existingReport = checkExistingReport(formData.weekNumber);
      if (existingReport) {
        // Ask user if they want to update the existing report
        const confirmUpdate = window.confirm(
          `A report for Week ${formData.weekNumber} already exists.\n\n` +
          `Do you want to UPDATE the existing report?\n\n` +
          `Click OK to update, or Cancel to choose a different week.`
        );

        if (confirmUpdate) {
          // Load the existing report for editing
          handleEditReport(existingReport);
          return;
        } else {
          return;
        }
      }
    }

    // Confirmation dialog before submission
    const actionText = editingReport ? 'update' : 'submit';
    const confirmMessage = editingReport
      ? `Are you sure you want to UPDATE the report for Week ${formData.weekNumber}?\n\n` +
        `${formData.reportFile ? 'This will replace the existing file.\n\n' : ''}` +
        `This action cannot be undone.`
      : `Are you sure you want to SUBMIT this report for Week ${formData.weekNumber}?\n\n` +
        `Please verify all details are correct before submitting.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    const data = new FormData();

    if (editingReport) {
      // Updating existing report
      if (formData.title) data.append('title', formData.title);
      if (formData.description) data.append('description', formData.description);
      if (formData.reportFile) data.append('reportFile', formData.reportFile);
    } else {
      // Creating new report
      data.append('applicationId', applicationId);
      data.append('weekNumber', formData.weekNumber);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('reportFile', formData.reportFile);
    }

    try {
      if (editingReport) {
        await reportsAPI.update(editingReport._id, data);
        setSuccess('Report updated successfully!');
      } else {
        await reportsAPI.upload(data);
        setSuccess('Report submitted successfully!');
      }

      // Reset form
      setFormData({ weekNumber: '', title: '', description: '', reportFile: null });
      setEditingReport(null);
      document.getElementById('reportFile').value = '';

      // Reload reports
      loadReports();

      // Scroll to reports list to see the update
      setTimeout(() => {
        const reportsList = document.querySelector('.reports-list');
        if (reportsList) {
          reportsList.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${actionText} report`);
    } finally {
      setLoading(false);
    }
  };

  // Get filename from path
  const getFileName = (filePath) => {
    if (!filePath) return 'Unknown file';
    return filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  };

  return (
    <div>
      {/* Upload/Update Form */}
      <div className="report-upload-form">
        <h4>{editingReport ? 'Update Existing Report' : 'Upload New Report'}</h4>

        {editingReport && (
          <div className="alert alert-info">
            <strong>Editing Report for Week {editingReport.weekNumber}</strong>
            <br />
            Current File: <strong>{getFileName(editingReport.filePath)}</strong>
            <br />
            <small>You can update the title, description, and/or replace the file below.</small>
          </div>
        )}

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
                disabled={!!editingReport} // Disable when editing
                required
              />
              {editingReport && (
                <small className="text-muted">Week number cannot be changed</small>
              )}
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
            <small className="text-muted">
              {formData.description.length}/50 characters minimum
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="reportFile">
              Report File {editingReport ? '(Optional - leave empty to keep current file)' : '* (PDF or DOCX)'}
            </label>
            <input
              type="file"
              id="reportFile"
              name="reportFile"
              className="form-control"
              onChange={handleChange}
              accept=".pdf,.doc,.docx"
              required={!editingReport} // Required only for new uploads
            />
            {formData.reportFile && (
              <small className="text-muted">
                Selected: {formData.reportFile.name}
              </small>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? (editingReport ? 'Updating...' : 'Uploading...')
                : (editingReport ? '✓ Update Report' : '📤 Submit Report')
              }
            </button>

            {editingReport && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                ✕ Cancel
              </button>
            )}
          </div>
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
                  <th>File</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th>Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>Week {report.weekNumber}</td>
                    <td>{report.title}</td>
                    <td>
                      <a
                        href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/${report.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                        style={{ textDecoration: 'none', fontWeight: '500' }}
                      >
                        📄 View Report
                      </a>
                      <br />
                      <small className="text-muted">{getFileName(report.filePath)}</small>
                    </td>
                    <td>{new Date(report.uploadDate).toLocaleDateString()}</td>
                    <td>
                      {report.reviewed ? (
                        <span className="status-badge status-accepted">Reviewed</span>
                      ) : (
                        <span className="status-badge status-pending">Pending</span>
                      )}
                    </td>
                    <td>{report.advisorFeedback || 'No feedback yet'}</td>
                    <td>
                      <button
                        onClick={() => handleEditReport(report)}
                        className="btn btn-sm btn-outline-primary"
                        style={{
                          padding: '5px 12px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                        title="Edit this report"
                      >
                        ✏️ Edit/Update
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
  );
};

export default ReportUpload;
