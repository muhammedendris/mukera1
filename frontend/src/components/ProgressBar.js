import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
  currentProgress = 0,
  internshipDurationWeeks = 0,
  reportsSubmitted = 0
}) => {
  // Determine progress status for styling
  const getProgressStatus = (progress) => {
    if (progress >= 100) return 'complete';
    if (progress >= 75) return 'excellent';
    if (progress >= 50) return 'good';
    if (progress >= 25) return 'started';
    return 'beginning';
  };

  const status = getProgressStatus(currentProgress);

  // Get motivational message based on progress
  const getMessage = (progress) => {
    if (progress >= 100) return 'Congratulations! Internship Complete!';
    if (progress >= 75) return 'Almost there! Keep up the great work!';
    if (progress >= 50) return 'Halfway through! You\'re doing great!';
    if (progress >= 25) return 'Good progress! Keep going!';
    if (progress > 0) return 'Great start! Submit weekly reports to track progress.';
    return 'Submit your first weekly report to begin tracking progress.';
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3 className="progress-title">Internship Progress</h3>
        <span className={`progress-percentage ${status}`}>
          {currentProgress}%
        </span>
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div
            className={`progress-bar-fill ${status}`}
            style={{ width: `${Math.min(currentProgress, 100)}%` }}
          >
            {currentProgress >= 10 && (
              <span className="progress-bar-text">{currentProgress}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="progress-stats">
        <div className="progress-stat">
          <span className="stat-value">{reportsSubmitted}</span>
          <span className="stat-label">Reports Submitted</span>
        </div>
        <div className="progress-stat">
          <span className="stat-value">{internshipDurationWeeks}</span>
          <span className="stat-label">Total Weeks</span>
        </div>
        <div className="progress-stat">
          <span className="stat-value">{Math.max(0, internshipDurationWeeks - reportsSubmitted)}</span>
          <span className="stat-label">Weeks Remaining</span>
        </div>
      </div>

      <div className={`progress-message ${status}`}>
        {getMessage(currentProgress)}
      </div>

      {/* Milestone markers */}
      <div className="progress-milestones">
        <div className={`milestone ${currentProgress >= 25 ? 'achieved' : ''}`}>
          <div className="milestone-marker">25%</div>
          <span className="milestone-label">Started</span>
        </div>
        <div className={`milestone ${currentProgress >= 50 ? 'achieved' : ''}`}>
          <div className="milestone-marker">50%</div>
          <span className="milestone-label">Halfway</span>
        </div>
        <div className={`milestone ${currentProgress >= 75 ? 'achieved' : ''}`}>
          <div className="milestone-marker">75%</div>
          <span className="milestone-label">Almost</span>
        </div>
        <div className={`milestone ${currentProgress >= 100 ? 'achieved' : ''}`}>
          <div className="milestone-marker">100%</div>
          <span className="milestone-label">Complete</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
