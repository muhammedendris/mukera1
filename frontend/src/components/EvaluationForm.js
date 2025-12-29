import React, { useState, useEffect } from 'react';
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
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);

  // Fetch existing evaluation on component mount
  useEffect(() => {
    const fetchExistingEvaluation = async () => {
      try {
        const response = await evaluationsAPI.getByApplication(applicationId);
        if (response.data.evaluation) {
          setExistingEvaluation(response.data.evaluation);
          setIsUpdate(true);
          // Pre-fill form with existing data
          setFormData({
            grade: response.data.evaluation.grade,
            technicalSkills: response.data.evaluation.technicalSkills,
            communication: response.data.evaluation.communication,
            professionalism: response.data.evaluation.professionalism,
            problemSolving: response.data.evaluation.problemSolving,
            overallPerformance: response.data.evaluation.overallPerformance,
            comments: response.data.evaluation.comments,
            strengths: response.data.evaluation.strengths || '',
            areasForImprovement: response.data.evaluation.areasForImprovement || '',
            recommendation: response.data.evaluation.recommendation
          });
        }
      } catch (error) {
        // No evaluation exists (404) - that's okay, create new
        console.log('No existing evaluation found');
      }
    };

    fetchExistingEvaluation();
  }, [applicationId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.comments.length < 50) {
      setError('Comments must be at least 50 characters');
      return;
    }

    // Confirmation dialog
    const actionText = isUpdate ? 'update' : 'submit';
    const confirmMessage = isUpdate
      ? `Are you sure you want to UPDATE this evaluation?\n\n` +
        `This will replace the previous grade and comments.\n\n` +
        `This action cannot be undone.`
      : `Are you sure you want to SUBMIT this grade?\n\n` +
        `Please verify all details are correct before submitting.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      if (isUpdate) {
        // Update existing evaluation
        await evaluationsAPI.update(existingEvaluation._id, formData);
      } else {
        // Create new evaluation
        await evaluationsAPI.submit({
          ...formData,
          applicationId,
          studentId
        });
      }

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${actionText} evaluation`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-form">
      {/* Update Mode Info Banner */}
      {isUpdate && existingEvaluation && (
        <div className="alert alert-info">
          <strong>Update Mode</strong>
          <br />
          You are updating an existing evaluation for this student.
          <br />
          <small>Previously submitted on: {new Date(existingEvaluation.submittedAt).toLocaleDateString()}</small>
        </div>
      )}

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
          {loading
            ? (isUpdate ? 'Updating...' : 'Submitting...')
            : (isUpdate ? '✓ Update Evaluation' : '📤 Submit Evaluation')
          }
        </button>
      </form>
    </div>
  );
};

export default EvaluationForm;
