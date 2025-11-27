import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../App.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.requestPasswordReset(email);

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep(2); // Move to step 2
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.resetPasswordWithOTP(email, otp, newPassword);

      if (response.data.success) {
        setSuccess(response.data.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h2 className="auth-title">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p className="auth-subtitle">
              {step === 1
                ? 'Enter your email to receive a password reset code'
                : 'Enter the OTP code and your new password'}
            </p>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otp">OTP Code</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    className="form-control"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError('');
                    }}
                    required
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Check your email for the 6-digit code (expires in 10 minutes)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    required
                    placeholder="Enter new password"
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    required
                    placeholder="Confirm new password"
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: '10px' }}
                  disabled={loading}
                >
                  Back to Email Entry
                </button>
              </form>
            )}

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
