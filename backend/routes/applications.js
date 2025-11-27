const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const User = require('../models/User');
const { isAuthenticated, isStudent, isAdmin, isVerified } = require('../middleware/auth');

// @route   POST /api/applications
// @desc    Submit internship application (Student only)
// @access  Private (Student, Verified)
router.post(
  '/',
  isAuthenticated,
  isStudent,
  isVerified,
  [
    body('requestedDuration').notEmpty().withMessage('Internship duration is required'),
    body('coverLetter').isLength({ min: 100 }).withMessage('Cover letter must be at least 100 characters')
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

      // Check if student already has a pending or accepted application
      const existingApplication = await Application.findOne({
        student: req.user._id,
        status: { $in: ['pending', 'accepted'] }
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active application. Please wait for a response.'
        });
      }

      const { requestedDuration, coverLetter } = req.body;

      const application = new Application({
        student: req.user._id,
        requestedDuration,
        coverLetter,
        status: 'pending'
      });

      await application.save();

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        application
      });
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   GET /api/applications
// @desc    Get applications (filtered by role)
// @access  Private
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'student') {
      // Students see only their own applications
      applications = await Application.find({ student: req.user._id })
        .populate('student', 'fullName email university department')
        .populate('assignedAdvisor', 'fullName email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'company-admin') {
      // Admin sees all applications
      applications = await Application.find()
        .populate('student', 'fullName email university department')
        .populate('assignedAdvisor', 'fullName email')
        .populate('reviewedBy', 'fullName')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'advisor') {
      // Advisor sees only their assigned applications
      applications = await Application.find({ assignedAdvisor: req.user._id })
        .populate('student', 'fullName email university department phone')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'dean') {
      // Dean sees applications from their university students
      const students = await User.find({
        role: 'student',
        university: req.user.university,
        department: req.user.department
      }).select('_id');

      const studentIds = students.map(s => s._id);

      applications = await Application.find({
        student: { $in: studentIds },
        status: 'accepted'
      })
        .populate('student', 'fullName email university department')
        .populate('assignedAdvisor', 'fullName email')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Private
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'fullName email university department phone address')
      .populate('assignedAdvisor', 'fullName email phone')
      .populate('reviewedBy', 'fullName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isOwner = application.student._id.toString() === req.user._id.toString();
    const isAssignedAdvisor = application.assignedAdvisor &&
                              application.assignedAdvisor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';

    if (!isOwner && !isAssignedAdvisor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/applications/:id/status
// @desc    Accept or reject application (Admin only)
// @access  Private (Admin)
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status, rejectionReason, internshipDurationWeeks } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

    // Validate internshipDurationWeeks when accepting
    if (status === 'accepted') {
      if (!internshipDurationWeeks) {
        return res.status(400).json({
          success: false,
          message: 'Internship duration (in weeks) is required when accepting an application'
        });
      }

      if (internshipDurationWeeks < 1) {
        return res.status(400).json({
          success: false,
          message: 'Internship duration must be at least 1 week'
        });
      }
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This application has already been processed'
      });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    if (status === 'accepted') {
      application.internshipDurationWeeks = internshipDurationWeeks;
      application.currentProgress = 0; // Initialize progress to 0%
    }

    await application.save();

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/applications/:id/assign-advisor
// @desc    Assign advisor to accepted application (Admin only)
// @access  Private (Admin)
router.patch('/:id/assign-advisor', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { advisorId } = req.body;

    if (!advisorId) {
      return res.status(400).json({
        success: false,
        message: 'Advisor ID is required'
      });
    }

    // Check if advisor exists and has correct role
    const advisor = await User.findOne({ _id: advisorId, role: 'advisor' });

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: 'Advisor not found'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign advisor to accepted applications'
      });
    }

    application.assignedAdvisor = advisorId;
    await application.save();

    res.json({
      success: true,
      message: 'Advisor assigned successfully',
      application
    });
  } catch (error) {
    console.error('Assign advisor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
