import React, { useState } from 'react';
import { applicationsAPI } from '../services/api';

const ApplicationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    requestedDuration: '',
    coverLetter: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
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
      await applicationsAPI.submit(formData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
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

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
