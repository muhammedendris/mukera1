import React, { useState } from 'react';
import { evaluationsAPI } from '../services/api';

const EvaluationForm = ({ applicationId, studentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    grade: 'B',
    technicalSkills: 75,
    communication: 75,
    professionalism: 75,
    problemSolving: 75,
    overallPerformance: 75,
    comments: '',
    strengths: '',
    areasForImprovement: '',
    recommendation: 'Recommended'
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

    if (formData.comments.length < 50) {
      setError('Comments must be at least 50 characters');
      setLoading(false);
      return;
    }

    try {
      await evaluationsAPI.submit({
        ...formData,
        applicationId,
        studentId
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-form">
      <h3>Student Evaluation</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Grade */}
        <div className="form-group">
          <label htmlFor="grade">Final Grade *</label>
          <select
            id="grade"
            name="grade"
            className="form-control"
            value={formData.grade}
            onChange={handleChange}
            required
          >
            <option value="A">A</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="B-">B-</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="C-">C-</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
        </div>

        {/* Performance Scores */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="technicalSkills">Technical Skills (0-100)</label>
            <input
              type="number"
              id="technicalSkills"
              name="technicalSkills"
              className="form-control"
              value={formData.technicalSkills}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="communication">Communication (0-100)</label>
            <input
              type="number"
              id="communication"
              name="communication"
              className="form-control"
              value={formData.communication}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="professionalism">Professionalism (0-100)</label>
            <input
              type="number"
              id="professionalism"
              name="professionalism"
              className="form-control"
              value={formData.professionalism}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="problemSolving">Problem Solving (0-100)</label>
            <input
              type="number"
              id="problemSolving"
              name="problemSolving"
              className="form-control"
              value={formData.problemSolving}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="overallPerformance">Overall Performance (0-100)</label>
          <input
            type="number"
            id="overallPerformance"
            name="overallPerformance"
            className="form-control"
            value={formData.overallPerformance}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>

        {/* Comments */}
        <div className="form-group">
          <label htmlFor="comments">Comments * (min 50 characters)</label>
          <textarea
            id="comments"
            name="comments"
            className="form-control"
            value={formData.comments}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
          <small>{formData.comments.length} / 50 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="strengths">Strengths</label>
          <textarea
            id="strengths"
            name="strengths"
            className="form-control"
            value={formData.strengths}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="areasForImprovement">Areas for Improvement</label>
          <textarea
            id="areasForImprovement"
            name="areasForImprovement"
            className="form-control"
            value={formData.areasForImprovement}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        {/* Recommendation */}
        <div className="form-group">
          <label htmlFor="recommendation">Recommendation *</label>
          <select
            id="recommendation"
            name="recommendation"
            className="form-control"
            value={formData.recommendation}
            onChange={handleChange}
            required
          >
            <option value="Highly Recommended">Highly Recommended</option>
            <option value="Recommended">Recommended</option>
            <option value="Recommended with Reservations">Recommended with Reservations</option>
            <option value="Not Recommended">Not Recommended</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </form>
    </div>
  );
};

export default EvaluationForm;
