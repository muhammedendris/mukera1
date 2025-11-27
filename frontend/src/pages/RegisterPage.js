import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    university: '',
    department: '',
    phone: '',
    address: '',
    idCard: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
    data.append('address', formData.address);
    data.append('idCard', formData.idCard);

    const result = await register(data);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card register-card">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join our internship program</p>

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

            <form onSubmit={handleSubmit} className="auth-form">
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
                  <input
                    type="text"
                    id="university"
                    name="university"
                    className="form-control"
                    value={formData.university}
                    onChange={handleChange}
                    required
                    placeholder="University name"
                  />
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

              {/* Address */}
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Your address"
                ></textarea>
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

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

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
