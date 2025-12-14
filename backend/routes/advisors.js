const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// @route   POST /api/advisors
// @desc    Create new advisor account (Admin only)
// @access  Private (Admin)
router.post(
  '/',
  isAuthenticated,
  isAdmin,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required')
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

      const { email, password, fullName, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new advisor
      const advisor = new User({
        email,
        password,
        fullName,
        role: 'advisor',
        phone,
        address,
        isVerified: true, // Advisors are auto-verified by admin
        isEmailVerified: true, // Skip email verification since admin created this account
        createdBy: req.user._id
      });

      await advisor.save();

      res.status(201).json({
        success: true,
        message: 'Advisor account created successfully',
        advisor: advisor.toSafeObject()
      });
    } catch (error) {
      console.error('Create advisor error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   GET /api/advisors
// @desc    Get all advisors (Admin only)
// @access  Private (Admin)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const advisors = await User.find({ role: 'advisor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: advisors.length,
      advisors
    });
  } catch (error) {
    console.error('Get advisors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/advisors/:id
// @desc    Get advisor by ID (Admin only)
// @access  Private (Admin)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const advisor = await User.findOne({
      _id: req.params.id,
      role: 'advisor'
    }).select('-password');

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: 'Advisor not found'
      });
    }

    res.json({
      success: true,
      advisor
    });
  } catch (error) {
    console.error('Get advisor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/advisors/:id
// @desc    Update advisor (Admin only)
// @access  Private (Admin)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { fullName, email, phone, address, password } = req.body;

    const advisor = await User.findOne({
      _id: req.params.id,
      role: 'advisor'
    });

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: 'Advisor not found'
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== advisor.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      advisor.email = email;
    }

    // Update fields
    if (fullName) advisor.fullName = fullName;
    if (phone) advisor.phone = phone;
    if (address) advisor.address = address;
    if (password) advisor.password = password; // Will be hashed by pre-save hook

    await advisor.save();

    res.json({
      success: true,
      message: 'Advisor updated successfully',
      advisor: advisor.toSafeObject()
    });
  } catch (error) {
    console.error('Update advisor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/advisors/:id
// @desc    Delete advisor (Admin only)
// @access  Private (Admin)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const advisor = await User.findOne({
      _id: req.params.id,
      role: 'advisor'
    });

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: 'Advisor not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Advisor deleted successfully'
    });
  } catch (error) {
    console.error('Delete advisor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
