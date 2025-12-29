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

  // Grade options with colors
  const grades = [
    { value: 'A', label: 'A', color: '#059669', bg: '#D1FAE5' },
    { value: 'A-', label: 'A-', color: '#059669', bg: '#D1FAE5' },
    { value: 'B+', label: 'B+', color: '#0060AA', bg: '#CCE0F5' },
    { value: 'B', label: 'B', color: '#0060AA', bg: '#CCE0F5' },
    { value: 'B-', label: 'B-', color: '#0060AA', bg: '#CCE0F5' },
    { value: 'C+', label: 'C+', color: '#D97706', bg: '#FEF3C7' },
    { value: 'C', label: 'C', color: '#D97706', bg: '#FEF3C7' },
    { value: 'C-', label: 'C-', color: '#D97706', bg: '#FEF3C7' },
    { value: 'D', label: 'D', color: '#DC2626', bg: '#FEE2E2' },
    { value: 'F', label: 'F', color: '#DC2626', bg: '#FEE2E2' }
  ];

  // Skills configuration
  const skills = [
    { key: 'technicalSkills', label: 'Technical Skills', icon: '💻', description: 'Programming, tools, and technical knowledge' },
    { key: 'communication', label: 'Communication', icon: '💬', description: 'Written and verbal communication abilities' },
    { key: 'professionalism', label: 'Professionalism', icon: '👔', description: 'Work ethic, punctuality, and behavior' },
    { key: 'problemSolving', label: 'Problem Solving', icon: '🧩', description: 'Analytical and critical thinking skills' }
  ];

  // Recommendation options
  const recommendations = [
    { value: 'Highly Recommended', icon: '🌟', color: '#059669', bg: '#D1FAE5' },
    { value: 'Recommended', icon: '✓', color: '#0060AA', bg: '#CCE0F5' },
    { value: 'Recommended with Reservations', icon: '📋', color: '#D97706', bg: '#FEF3C7' },
    { value: 'Not Recommended', icon: '✕', color: '#DC2626', bg: '#FEE2E2' }
  ];

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#0060AA';
    if (score >= 40) return '#D97706';
    return '#DC2626';
  };

  // Fetch existing evaluation on component mount
  useEffect(() => {
    const fetchExistingEvaluation = async () => {
      try {
        const response = await evaluationsAPI.getByApplication(applicationId);
        if (response.data.evaluation) {
          setExistingEvaluation(response.data.evaluation);
          setIsUpdate(true);
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

  const handleSliderChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: parseInt(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.comments.length < 50) {
      setError('Comments must be at least 50 characters');
      return;
    }

    const actionText = isUpdate ? 'update' : 'submit';
    const confirmMessage = isUpdate
      ? `Are you sure you want to UPDATE this evaluation?\n\nThis will replace the previous grade and comments.`
      : `Are you sure you want to SUBMIT this evaluation?\n\nPlease verify all details are correct.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      if (isUpdate) {
        await evaluationsAPI.update(existingEvaluation._id, formData);
      } else {
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
    <div style={{ padding: '0' }}>
      {/* Update Mode Banner */}
      {isUpdate && existingEvaluation && (
        <div style={{
          background: 'linear-gradient(135deg, #EBF5FF 0%, #CCE0F5 100%)',
          border: '1px solid #0060AA',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>📝</span>
          <div>
            <strong style={{ color: '#0060AA' }}>Update Mode</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#004D8C' }}>
              Previously submitted on: {new Date(existingEvaluation.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #DC2626',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Grade Selection */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            color: '#1F2937',
            fontSize: '15px'
          }}>
            Final Grade *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px'
          }}>
            {grades.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setFormData({ ...formData, grade: g.value })}
                style={{
                  padding: '12px 8px',
                  border: formData.grade === g.value ? `2px solid ${g.color}` : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  background: formData.grade === g.value ? g.bg : 'white',
                  color: formData.grade === g.value ? g.color : '#6B7280',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: formData.grade === g.value ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Assessment */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            marginBottom: '16px',
            fontWeight: '600',
            color: '#1F2937',
            fontSize: '15px'
          }}>
            Skills Assessment
          </label>

          {skills.map((skill) => (
            <div key={skill.key} style={{
              background: '#F9FAFB',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{skill.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1F2937' }}>{skill.label}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{skill.description}</div>
                  </div>
                </div>
                <div style={{
                  background: getScoreColor(formData[skill.key]),
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  fontSize: '14px',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {formData[skill.key]}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData[skill.key]}
                onChange={(e) => handleSliderChange(skill.key, e.target.value)}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, ${getScoreColor(formData[skill.key])} 0%, ${getScoreColor(formData[skill.key])} ${formData[skill.key]}%, #E5E7EB ${formData[skill.key]}%, #E5E7EB 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>
          ))}
        </div>

        {/* Overall Performance */}
        <div style={{
          background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>Overall Performance</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Combined assessment score</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '32px',
              fontWeight: '800'
            }}>
              {formData.overallPerformance}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.overallPerformance}
            onChange={(e) => handleSliderChange('overallPerformance', e.target.value)}
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '5px',
              appearance: 'none',
              background: `linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) ${formData.overallPerformance}%, rgba(255,255,255,0.3) ${formData.overallPerformance}%, rgba(255,255,255,0.3) 100%)`,
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Comments */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#1F2937',
            fontSize: '15px'
          }}>
            Comments * <span style={{ fontWeight: '400', color: '#6B7280', fontSize: '13px' }}>(min 50 characters)</span>
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
            placeholder="Provide detailed feedback about the student's performance..."
            style={{
              width: '100%',
              padding: '14px',
              border: '2px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              resize: 'vertical',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0060AA'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            required
          />
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '6px',
            fontSize: '13px',
            color: formData.comments.length >= 50 ? '#059669' : '#6B7280'
          }}>
            {formData.comments.length >= 50 ? '✓ ' : ''}{formData.comments.length} / 50 characters
          </div>
        </div>

        {/* Strengths */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#166534',
            fontSize: '15px'
          }}>
            <span style={{ fontSize: '18px' }}>💪</span> Strengths
          </label>
          <textarea
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            rows="3"
            placeholder="What did the student excel at?"
            style={{
              width: '100%',
              padding: '14px',
              border: '2px solid #BBF7D0',
              borderRadius: '10px',
              fontSize: '14px',
              resize: 'vertical',
              background: '#F0FDF4',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#22C55E'}
            onBlur={(e) => e.target.style.borderColor = '#BBF7D0'}
          />
        </div>

        {/* Areas for Improvement */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#92400E',
            fontSize: '15px'
          }}>
            <span style={{ fontSize: '18px' }}>📈</span> Areas for Improvement
          </label>
          <textarea
            name="areasForImprovement"
            value={formData.areasForImprovement}
            onChange={handleChange}
            rows="3"
            placeholder="What areas could the student improve on?"
            style={{
              width: '100%',
              padding: '14px',
              border: '2px solid #FDE68A',
              borderRadius: '10px',
              fontSize: '14px',
              resize: 'vertical',
              background: '#FFFBEB',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
            onBlur={(e) => e.target.style.borderColor = '#FDE68A'}
          />
        </div>

        {/* Recommendation */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            color: '#1F2937',
            fontSize: '15px'
          }}>
            Recommendation *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            {recommendations.map((rec) => (
              <button
                key={rec.value}
                type="button"
                onClick={() => setFormData({ ...formData, recommendation: rec.value })}
                style={{
                  padding: '14px 12px',
                  border: formData.recommendation === rec.value ? `2px solid ${rec.color}` : '2px solid #E5E7EB',
                  borderRadius: '10px',
                  background: formData.recommendation === rec.value ? rec.bg : 'white',
                  color: formData.recommendation === rec.value ? rec.color : '#6B7280',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '18px' }}>{rec.icon}</span>
                {rec.value}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(0, 96, 170, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              {isUpdate ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            <>
              <span style={{ fontSize: '20px' }}>{isUpdate ? '✓' : '📤'}</span>
              {isUpdate ? 'Update Evaluation' : 'Submit Evaluation'}
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default EvaluationForm;
