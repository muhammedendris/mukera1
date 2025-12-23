import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Toast from '../components/Toast';
import '../App.css';

// Helper function to generate random numbers for Math CAPTCHA
const generateMathCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
  const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
  return { num1, num2, answer: num1 + num2 };
};

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    university: '',
    department: '',
    phone: '',
    idCard: null
  });

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Security Verification States
  const [mathCaptcha, setMathCaptcha] = useState(generateMathCaptcha());
  const [mathAnswer, setMathAnswer] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Generate new Math CAPTCHA when component loads
  useEffect(() => {
    setMathCaptcha(generateMathCaptcha());
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'idCard') {
      setFormData({
        ...formData,
        idCard: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
    setError('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Security Verification - Math CAPTCHA
    if (parseInt(mathAnswer) !== mathCaptcha.answer) {
      setError('❌ Math verification failed. Please solve the math problem correctly.');
      setLoading(false);
      // Generate new CAPTCHA for security
      setMathCaptcha(generateMathCaptcha());
      setMathAnswer('');
      return;
    }

    // Security Verification - Logic Test (case-insensitive)
    if (securityAnswer.trim().toLowerCase() !== 'intern') {
      setError('❌ Security verification failed. Please type the word correctly.');
      setLoading(false);
      return;
    }

    // Name Validation - Only letters and spaces allowed
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.fullName.trim())) {
      setError('Name must contain letters only. Numbers and special characters are not allowed.');
      setLoading(false);
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.idCard) {
      setError('Please upload your ID card');
      setLoading(false);
      return;
    }

    // Create FormData
    const data = new FormData();
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('fullName', formData.fullName);
    data.append('role', formData.role);
    data.append('university', formData.university);
    data.append('department', formData.department);
    data.append('phone', formData.phone);
    data.append('idCard', formData.idCard);

    const result = await register(data);

    if (result.success) {
      setSuccess(result.message);
      setRegisteredEmail(result.email || formData.email);
      // Move to OTP verification step
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.verifyEmail(registeredEmail, otp);

      if (response.data.success) {
        setSuccess(response.data.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.resendVerificationOTP(registeredEmail);

      if (response.data.success) {
        setSuccess(response.data.message);
      } else {
        setError(response.data.message || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-page">
      {/* Toast Notifications */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError('')}
          duration={5000}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess('')}
          duration={5000}
        />
      )}

      <div className="container">
        <div className="auth-container">
          <div className="auth-card register-card">
            <h2 className="auth-title">
              {step === 1 ? 'Create Account' : 'Verify Your Email'}
            </h2>
            <p className="auth-subtitle">
              {step === 1
                ? 'Join our internship program'
                : `Enter the verification code sent to ${registeredEmail}`}
            </p>

            {step === 1 ? (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                {/* Role Selection */}
                <div className="form-group">
                  <label htmlFor="role">I am a</label>
                  <select
                    id="role"
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="dean">Department Dean</option>
                  </select>
                </div>

                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="your name"
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Password */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                {/* University & Department */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="university">University</label>
                    <select
                      id="university"
                      name="university"
                      className="form-control university-select"
                      value={formData.university}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your university</option>
                      <option value="Addis Ababa University">Addis Ababa University</option>
                      <option value="Jimma University">Jimma University</option>
                      <option value="Gondar University">Gondar University</option>
                      <option value="Haramaya University">Haramaya University</option>
                      <option value="Bahir Dar University">Bahir Dar University</option>
                      <option value="Hawassa University">Hawassa University</option>
                      <option value="Mekelle University">Mekelle University</option>
                      <option value="Arba Minch University">Arba Minch University</option>
                      <option value="Adama Science and Technology University">Adama Science and Technology University</option>
                      <option value="Dire Dawa University">Dire Dawa University</option>
                      <option value="Wollo University">Wollo University</option>
                      <option value="Debre Markos University">Debre Markos University</option>
                      <option value="Debre Berhan University">Debre Berhan University</option>
                      <option value="Wolkite University">Wolkite University</option>
                      <option value="Wolaita Sodo University">Wolaita Sodo University</option>
                      <option value="Mizan-Tepi University">Mizan-Tepi University</option>
                      <option value="Bule Hora University">Bule Hora University</option>
                      <option value="Dilla University">Dilla University</option>
                      <option value="Wachemo University">Wachemo University</option>
                      <option value="Woldia University">Woldia University</option>
                      <option value="Adigrat University">Adigrat University</option>
                      <option value="Aksum University">Aksum University</option>
                      <option value="Madda Walabu University">Madda Walabu University</option>
                      <option value="Mettu University">Mettu University</option>
                      <option value="Assosa University">Assosa University</option>
                      <option value="Semera University">Semera University</option>
                      <option value="Jigjiga University">Jigjiga University</option>
                      <option value="Gambella University">Gambella University</option>
                      <option value="Samara University">Samara University</option>
                      <option value="Jinka University">Jinka University</option>
                      <option value="Ambo University">Ambo University</option>
                      <option value="Raya University">Raya University</option>
                      <option value="Injibara University">Injibara University</option>
                      <option value="Debark University">Debark University</option>
                      <option value="Debre Tabor University">Debre Tabor University</option>
                      <option value="Bonga University">Bonga University</option>
                      <option value="Dembi Dollo University">Dembi Dollo University</option>
                      <option value="Oda Bultum University">Oda Bultum University</option>
                      <option value="Salale University">Salale University</option>
                      <option value="Kebri Dehar University">Kebri Dehar University</option>
                      <option value="Mekdela Amba University">Mekdela Amba University</option>
                      <option value="Ethiopian Civil Service University">Ethiopian Civil Service University</option>
                      <option value="Defense University College">Defense University College</option>
                      <option value="Kotebe Metropolitan University">Kotebe Metropolitan University</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      className="form-control"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      placeholder="Department name"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="phone number"
                  />
                </div>

                {/* ID Card Upload */}
                <div className="form-group">
                  <label htmlFor="idCard">
                    {formData.role === 'student' ? 'Student ID Card' : 'Staff ID Card'} *
                  </label>
                  <input
                    type="file"
                    id="idCard"
                    name="idCard"
                    className="form-control"
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                  />
                  <small className="form-text">
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </small>
                </div>

                {/* Security Check Section */}
                <div style={{
                  background: '#f8f9fa',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '20px',
                  marginTop: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#495057',
                    marginTop: '0',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>🔒</span>
                    Security Check (Anti-Bot Verification)
                  </h3>

                  {/* Math CAPTCHA */}
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="mathAnswer" style={{ fontWeight: '500', color: '#495057' }}>
                      1. Solve this math problem: <span style={{
                        background: '#0060AA',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {mathCaptcha.num1} + {mathCaptcha.num2} = ?
                      </span>
                    </label>
                    <input
                      type="number"
                      id="mathAnswer"
                      className="form-control"
                      value={mathAnswer}
                      onChange={(e) => {
                        setMathAnswer(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your answer"
                      required
                      style={{
                        marginTop: '8px',
                        border: '2px solid #ced4da',
                        padding: '10px'
                      }}
                    />
                  </div>

                  {/* Logic Test / Security Question */}
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="securityAnswer" style={{ fontWeight: '500', color: '#495057' }}>
                      2. Type the word <span style={{
                        background: '#0D9488',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>INTERN</span> below to verify:
                    </label>
                    <input
                      type="text"
                      id="securityAnswer"
                      className="form-control"
                      value={securityAnswer}
                      onChange={(e) => {
                        setSecurityAnswer(e.target.value);
                        setError('');
                      }}
                      placeholder="Type: INTERN"
                      required
                      style={{
                        marginTop: '8px',
                        border: '2px solid #ced4da',
                        padding: '10px'
                      }}
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: '#6c757d', fontStyle: 'italic' }}>
                      (Case-insensitive: you can type "intern" or "INTERN")
                    </small>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otp">Verification Code</label>
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
                    style={{
                      fontSize: '24px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                  />
                  <small className="form-text" style={{ display: 'block', marginTop: '8px', textAlign: 'center' }}>
                    Check your email for the 6-digit code (expires in 10 minutes)
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: '10px' }}
                  disabled={loading}
                >
                  Resend Verification Code
                </button>

                <button
                  type="button"
                  onClick={handleBackToRegistration}
                  className="btn btn-link btn-block"
                  style={{ marginTop: '10px', color: '#0060AA', textDecoration: 'underline' }}
                  disabled={loading}
                >
                  Back to Registration
                </button>
              </form>
            )}

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
