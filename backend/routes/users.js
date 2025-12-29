const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated, isAdmin, isDean } = require('../middleware/auth');
const { uploadAcceptanceLetter, handleMulterError } = require('../middleware/upload');

// @route   GET /api/users/pending-deans
// @desc    Get all pending dean registrations (Admin only)
// @access  Private (Admin)
router.get('/pending-deans', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingDeans = await User.find({
      role: 'dean',
      isVerified: false
    }).select('-password');

    res.json({
      success: true,
      count: pendingDeans.length,
      deans: pendingDeans
    });
  } catch (error) {
    console.error('Get pending deans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/pending-students
// @desc    Get pending students from dean's university (Dean only)
// @access  Private (Dean)
router.get('/pending-students', isAuthenticated, isDean, async (req, res) => {
  try {
    const pendingStudents = await User.find({
      role: 'student',
      university: req.user.university,
      department: req.user.department,
      isVerified: false
    }).select('-password');

    res.json({
      success: true,
      count: pendingStudents.length,
      students: pendingStudents
    });
  } catch (error) {
    console.error('Get pending students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/users/:id/verify
// @desc    Verify a user (Admin verifies Dean, Dean verifies Student)
// @access  Private (Admin or Dean)
router.patch('/:id/verify', isAuthenticated, uploadAcceptanceLetter, handleMulterError, async (req, res) => {
  try {
    const userId = req.params.id;
    const { action } = req.body; // 'approve' or 'reject'

    // Find the user to be verified
    const userToVerify = await User.findById(userId);

    if (!userToVerify) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.role === 'company-admin' && userToVerify.role === 'dean') {
      // Admin can verify deans
      if (action === 'approve') {
        userToVerify.isVerified = true;
        userToVerify.verifiedBy = req.user._id;
        userToVerify.verifiedAt = new Date();
        await userToVerify.save();

        return res.json({
          success: true,
          message: 'Dean account verified successfully',
          user: userToVerify.toSafeObject()
        });
      } else if (action === 'reject') {
        // Delete the user if rejected
        await User.findByIdAndDelete(userId);

        return res.json({
          success: true,
          message: 'Dean registration rejected and deleted'
        });
      }
    } else if (req.user.role === 'dean' && userToVerify.role === 'student') {
      // Dean can verify students from their university
      if (userToVerify.university !== req.user.university ||
          userToVerify.department !== req.user.department) {
        return res.status(403).json({
          success: false,
          message: 'You can only verify students from your university and department'
        });
      }

      if (action === 'approve') {
        userToVerify.isVerified = true;
        userToVerify.verifiedBy = req.user._id;
        userToVerify.verifiedAt = new Date();

        // If acceptance letter file was uploaded
        if (req.file) {
          userToVerify.acceptanceLetterPath = '/uploads/acceptance-letters/' + req.file.filename;
        }

        await userToVerify.save();

        return res.json({
          success: true,
          message: 'Student account verified successfully',
          user: userToVerify.toSafeObject()
        });
      } else if (action === 'reject') {
        // Delete the user if rejected
        await User.findByIdAndDelete(userId);

        return res.json({
          success: true,
          message: 'Student registration rejected and deleted'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to verify this user'
      });
    }
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (including ID card path)
// @access  Private
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions - admins can see all, deans can see their students
    if (req.user.role === 'company-admin' ||
        (req.user.role === 'dean' && user.university === req.user.university) ||
        req.user._id.toString() === user._id.toString()) {
      return res.json({
        success: true,
        user
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
