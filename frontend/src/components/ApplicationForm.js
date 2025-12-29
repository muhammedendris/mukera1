import React, { useState } from 'react';
import { applicationsAPI } from '../services/api';

const ApplicationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    requestedDuration: '',
    coverLetter: ''
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF and DOCX files are allowed');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.coverLetter.length < 100) {
      setError('Cover letter must be at least 100 characters');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('requestedDuration', formData.requestedDuration);
      submitData.append('coverLetter', formData.coverLetter);
      if (file) {
        submitData.append('attachment', file);
      }

      await applicationsAPI.submitWithFile(submitData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Internship Application</h2>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="requestedDuration">Requested Internship Duration *</label>
          <input
            type="text"
            id="requestedDuration"
            name="requestedDuration"
            className="form-control"
            value={formData.requestedDuration}
            onChange={handleChange}
            placeholder="e.g., 3 Months, 6 Weeks, 2 Months"
            required
          />
          <small className="form-text">
            Enter your preferred internship duration (e.g., "3 Months")
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="coverLetter">Cover Letter * (minimum 100 characters)</label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            className="form-control"
            rows="10"
            value={formData.coverLetter}
            onChange={handleChange}
            required
            placeholder="Tell us why you want this internship, what you hope to learn, and what skills you can bring..."
          ></textarea>
          <small className="form-text">
            {formData.coverLetter.length} / 100 characters minimum
          </small>
        </div>

        {/* File Upload Section */}
        <div className="form-group">
          <label>Attach CV/Resume (Optional)</label>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '12px' }}>
            Upload your CV or resume as PDF or DOCX file (max 10MB)
          </p>

          <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? '#0060AA' : file ? '#28A745' : '#D1D5DB'}`,
              borderRadius: '12px',
              padding: file ? '16px' : '32px 24px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              background: dragActive ? '#E7F3FF' : file ? '#F0FDF4' : '#F9FAFB',
              cursor: 'pointer'
            }}
          >
            {!file ? (
              <>
                <div style={{ color: dragActive ? '#0060AA' : '#9CA3AF', marginBottom: '12px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17,8 12,3 7,8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '0.95rem' }}>
                  Drag and drop your file here, or
                </p>
                <label style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
                <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: '#9CA3AF' }}>
                  PDF or DOCX, max 10MB
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  {file.type === 'application/pdf' ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#DC2626">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8" fill="none" stroke="#fff" strokeWidth="1.5"></polyline>
                      <text x="8" y="17" fill="#fff" fontSize="6" fontWeight="bold">PDF</text>
                    </svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#2563EB">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8" fill="none" stroke="#fff" strokeWidth="1.5"></polyline>
                      <text x="6" y="17" fill="#fff" fontSize="5" fontWeight="bold">DOC</text>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: '500', color: '#1F2937', fontSize: '0.95rem', wordBreak: 'break-all' }}>
                    {file.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: '#FEE2E2',
                    borderRadius: '8px',
                    color: '#DC2626',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ marginTop: '16px' }}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
