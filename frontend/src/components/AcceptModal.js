import React, { useState } from 'react';
import './AcceptModal.css';

const AcceptModal = ({ isOpen, onClose, student, onConfirm, loading }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen || !student) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Only PDF and DOCX files are allowed');
        return;
      }
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
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
      const droppedFile = e.dataTransfer.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(droppedFile.type)) {
        alert('Only PDF and DOCX files are allowed');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleSubmit = () => {
    onConfirm(student._id, file);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('accept-modal-overlay')) {
      onClose();
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="accept-modal-overlay" onClick={handleBackdropClick}>
      <div className="accept-modal-container">
        {/* Header */}
        <div className="accept-modal-header">
          <h2>Accept Student</h2>
          <button className="accept-modal-close" onClick={onClose} disabled={loading}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="accept-modal-body">
          {/* Student Info */}
          <div className="student-info-card">
            <div className="student-avatar">
              {student.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="student-details">
              <h3>{student.fullName}</h3>
              <p>{student.email}</p>
              <span className="student-dept">{student.department}</span>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="file-upload-section">
            <label className="section-label">
              Attach Acceptance Letter (Optional)
            </label>
            <p className="section-hint">
              Upload a PDF or DOCX file that will be sent to the student
            </p>

            <div
              className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <div className="drop-zone-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17,8 12,3 7,8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <p className="drop-zone-text">
                    Drag and drop your file here, or
                  </p>
                  <label className="browse-button">
                    Browse Files
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                  <p className="file-hint">PDF or DOCX, max 10MB</p>
                </>
              ) : (
                <div className="file-preview">
                  <div className="file-icon">
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
                  <div className="file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button className="remove-file" onClick={removeFile} type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="confirmation-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0060AA" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            <span>This student will be approved and can apply for internships.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="accept-modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-accept"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                Accept Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptModal;
