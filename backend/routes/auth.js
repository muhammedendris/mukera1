const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { uploadIdCard, handleMulterError } = require('../middleware/upload');
const { requestPasswordReset, resetPasswordWithOTP } = require('../controllers/passwordResetController');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Student or Dean)
// @access  Public
router.post(
  '/register',
  uploadIdCard,
  handleMulterError,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').isIn(['student', 'dean']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, fullName, role, university, department, phone, address } = req.body;

      // Check if ID card was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'ID card upload is required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        fullName,
        role,
        university,
        department,
        phone,
        address,
        idCardPath: `/uploads/id-cards/${req.file.filename}`,
        isVerified: false
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Registration successful. Your account is pending verification.',
        user: user.toSafeObject()
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if dean account is verified (deans can't login until verified)
      if (user.role === 'dean' && !user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending verification by the Company Admin. Please wait for approval.'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: user.toSafeObject()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
// @access  Public
router.post('/forgot-password', requestPasswordReset);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', resetPasswordWithOTP);

module.exports = router;
