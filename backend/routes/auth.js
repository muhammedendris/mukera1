const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const { uploadRegistration, handleMulterError } = require('../config/cloudinary');
const { requestPasswordReset, resetPasswordWithOTP } = require('../controllers/passwordResetController');
const { resendVerificationOTP, verifyEmailWithOTP } = require('../controllers/emailVerificationController');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user (Student or Dean)
// @access  Public
router.post(
  '/register',
  uploadRegistration,
  handleMulterError,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').isIn(['student', 'dean']).withMessage('Invalid role')
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Call the controller
    return registerUser(req, res);
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
        console.log('❌ Login validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      console.log('✅ Login validation passed, calling controller...');
      // Call the controller
      return loginUser(req, res);
    } catch (error) {
      console.error('❌ Login route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in login route',
        error: error.message
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', isAuthenticated, getCurrentUser);

// @route   POST /api/auth/debug-check-user
// @desc    Debug endpoint to check if user exists
// @access  Public (FOR DEBUGGING ONLY - REMOVE IN PRODUCTION)
router.post('/debug-check-user', async (req, res) => {
  try {
    const User = require('../models/User');
    const { email } = req.body;

    console.log('\n🔍 DEBUG: Checking user:', email);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      return res.json({
        exists: false,
        message: 'User not found in database'
      });
    }

    console.log('✅ User found:', {
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isVerified: user.isVerified
    });

    return res.json({
      exists: true,
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Debug check error:', error);
    return res.status(500).json({
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

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
router.post('/verify-email', verifyEmailWithOTP);

// @route   POST /api/auth/resend-verification-otp
// @desc    Resend email verification OTP
// @access  Public
router.post('/resend-verification-otp', resendVerificationOTP);

module.exports = router;
