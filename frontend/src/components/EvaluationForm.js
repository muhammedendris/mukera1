import React, { useState, useEffect } from 'react';
import { evaluationsAPI } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EvaluationForm = ({ applicationId, studentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    skillsAssessment: [
      { skillName: 'Communication', score: 75 },
      { skillName: 'Technical Skills', score: 75 },
      { skillName: 'Problem Solving', score: 75 }
    ],
    comments: '',
    strengths: '',
    areasForImprovement: '',
    recommendation: 'Recommended'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  // Recommendation options
  const recommendations = [
    { value: 'Highly Recommended', icon: '🌟', color: '#059669', bg: '#D1FAE5' },
    { value: 'Recommended', icon: '✓', color: '#0060AA', bg: '#CCE0F5' },
    { value: 'Recommended with Reservations', icon: '📋', color: '#D97706', bg: '#FEF3C7' },
    { value: 'Not Recommended', icon: '✕', color: '#DC2626', bg: '#FEE2E2' }
  ];

  // Calculate total and average scores
  const calculateScores = () => {
    if (formData.skillsAssessment.length === 0) {
      return { total: 0, average: 0 };
    }
    const total = formData.skillsAssessment.reduce((sum, skill) => sum + (parseInt(skill.score) || 0), 0);
    const average = Math.round(total / formData.skillsAssessment.length);
    return { total, average };
  };

  const { total: totalScore, average: averageScore } = calculateScores();

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
          const evaluation = response.data.evaluation;
          setExistingEvaluation(evaluation);
          setStudentInfo(evaluation.student);
          setIsUpdate(true);
          setFormData({
            skillsAssessment: evaluation.skillsAssessment || [],
            comments: evaluation.comments || '',
            strengths: evaluation.strengths || '',
            areasForImprovement: evaluation.areasForImprovement || '',
            recommendation: evaluation.recommendation || 'Recommended'
          });
        }
      } catch (error) {
        console.log('No existing evaluation found');
      }
    };

    fetchExistingEvaluation();
  }, [applicationId]);

  // Add new skill
  const handleAddSkill = () => {
    setFormData({
      ...formData,
      skillsAssessment: [
        ...formData.skillsAssessment,
        { skillName: '', score: 50 }
      ]
    });
  };

  // Remove skill
  const handleRemoveSkill = (index) => {
    if (formData.skillsAssessment.length <= 1) {
      setError('At least one skill assessment is required');
      return;
    }
    const newSkills = formData.skillsAssessment.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      skillsAssessment: newSkills
    });
    setError('');
  };

  // Update skill name
  const handleSkillNameChange = (index, value) => {
    const newSkills = [...formData.skillsAssessment];
    newSkills[index].skillName = value;
    setFormData({
      ...formData,
      skillsAssessment: newSkills
    });
  };

  // Update skill score
  const handleSkillScoreChange = (index, value) => {
    const newSkills = [...formData.skillsAssessment];
    newSkills[index].score = parseInt(value) || 0;
    setFormData({
      ...formData,
      skillsAssessment: newSkills
    });
  };

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

    // Validation
    if (formData.skillsAssessment.length === 0) {
      setError('At least one skill assessment is required');
      return;
    }

    for (let skill of formData.skillsAssessment) {
      if (!skill.skillName.trim()) {
        setError('All skill names must be filled in');
        return;
      }
      if (skill.score < 0 || skill.score > 100) {
        setError('All scores must be between 0 and 100');
        return;
      }
    }

    if (formData.comments.length < 50) {
      setError('Comments must be at least 50 characters');
      return;
    }

    const actionText = isUpdate ? 'update' : 'submit';
    const confirmMessage = isUpdate
      ? `Are you sure you want to UPDATE this evaluation?\n\nThis will replace the previous assessment.`
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

  // Generate PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFillColor(0, 96, 170);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Evaluation Report', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    let yPos = 50;

    // Student Information
    if (studentInfo) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Information', 14, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${studentInfo.fullName || 'N/A'}`, 14, yPos);
      yPos += 7;
      doc.text(`Email: ${studentInfo.email || 'N/A'}`, 14, yPos);
      yPos += 7;
      doc.text(`University: ${studentInfo.university || 'N/A'}`, 14, yPos);
      yPos += 7;
      doc.text(`Department: ${studentInfo.department || 'N/A'}`, 14, yPos);
      yPos += 12;
    }

    // Skills Assessment Table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills Assessment', 14, yPos);
    yPos += 5;

    const skillsData = formData.skillsAssessment.map((skill, index) => [
      index + 1,
      skill.skillName,
      skill.score + '/100'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Skill Name', 'Score']],
      body: skillsData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 96, 170],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 11
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 120 },
        2: { cellWidth: 45, halign: 'center' }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Score Summary
    doc.setFillColor(240, 249, 255);
    doc.rect(14, yPos, 182, 20, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Score: ${totalScore}`, 20, yPos + 8);
    doc.text(`Average Score: ${averageScore}/100`, 20, yPos + 15);

    yPos += 30;

    // Comments
    if (formData.comments) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Comments', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const commentLines = doc.splitTextToSize(formData.comments, 180);
      doc.text(commentLines, 14, yPos);
      yPos += (commentLines.length * 5) + 10;
    }

    // Strengths
    if (formData.strengths && yPos < 270) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Strengths', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const strengthLines = doc.splitTextToSize(formData.strengths, 180);
      doc.text(strengthLines, 14, yPos);
      yPos += (strengthLines.length * 5) + 10;
    }

    // Areas for Improvement (new page if needed)
    if (formData.areasForImprovement) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Areas for Improvement', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const improvementLines = doc.splitTextToSize(formData.areasForImprovement, 180);
      doc.text(improvementLines, 14, yPos);
      yPos += (improvementLines.length * 5) + 10;
    }

    // Recommendation
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendation', 14, yPos);
    yPos += 7;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.recommendation, 14, yPos);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Internship Management System - Confidential', 105, 285, { align: 'center' });
    }

    // Save PDF
    const fileName = studentInfo
      ? `Evaluation_${studentInfo.fullName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
      : `Evaluation_${new Date().getTime()}.pdf`;

    doc.save(fileName);
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
          <button
            onClick={handleDownloadPDF}
            style={{
              marginLeft: 'auto',
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📄</span> Download PDF
          </button>
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
        {/* Dynamic Skills Assessment */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <label style={{
              fontWeight: '600',
              color: '#1F2937',
              fontSize: '15px'
            }}>
              Skills Assessment *
            </label>
            <button
              type="button"
              onClick={handleAddSkill}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span> Add Skill
            </button>
          </div>

          {formData.skillsAssessment.map((skill, index) => (
            <div key={index} style={{
              background: '#F9FAFB',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px auto',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Skill Name Input */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6B7280',
                    marginBottom: '6px'
                  }}>
                    Skill Name
                  </label>
                  <input
                    type="text"
                    value={skill.skillName}
                    onChange={(e) => handleSkillNameChange(index, e.target.value)}
                    placeholder="e.g., Communication, Coding"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0060AA'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                {/* Score Badge */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: getScoreColor(skill.score),
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '18px',
                    minWidth: '60px',
                    margin: '0 auto 8px auto'
                  }}>
                    {skill.score}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.score}
                    onChange={(e) => handleSkillScoreChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      appearance: 'none',
                      background: `linear-gradient(to right, ${getScoreColor(skill.score)} 0%, ${getScoreColor(skill.score)} ${skill.score}%, #E5E7EB ${skill.score}%, #E5E7EB 100%)`,
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  disabled={formData.skillsAssessment.length <= 1}
                  style={{
                    padding: '10px',
                    background: formData.skillsAssessment.length <= 1 ? '#E5E7EB' : '#FEE2E2',
                    color: formData.skillsAssessment.length <= 1 ? '#9CA3AF' : '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: formData.skillsAssessment.length <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete skill"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Score Display */}
        <div style={{
          background: 'linear-gradient(135deg, #0060AA 0%, #004D8C 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          color: 'white'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Score</div>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                fontFamily: 'monospace'
              }}>
                {totalScore}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Average Score</div>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                fontFamily: 'monospace'
              }}>
                {averageScore}/100
              </div>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${averageScore}%`,
              height: '100%',
              background: 'rgba(255,255,255,0.9)',
              transition: 'width 0.3s ease',
              borderRadius: '8px'
            }} />
          </div>
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
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
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
