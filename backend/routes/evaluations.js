const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Evaluation = require('../models/Evaluation');
const Application = require('../models/Application');
const User = require('../models/User');
const { isAuthenticated, isAdvisor } = require('../middleware/auth');

// @route   POST /api/evaluations
// @desc    Submit evaluation for a student (Advisor only)
// @access  Private (Advisor)
router.post(
  '/',
  isAuthenticated,
  isAdvisor,
  [
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('grade').isIn(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']).withMessage('Invalid grade'),
    body('technicalSkills').isInt({ min: 0, max: 100 }).withMessage('Technical skills must be between 0-100'),
    body('communication').isInt({ min: 0, max: 100 }).withMessage('Communication must be between 0-100'),
    body('professionalism').isInt({ min: 0, max: 100 }).withMessage('Professionalism must be between 0-100'),
    body('problemSolving').isInt({ min: 0, max: 100 }).withMessage('Problem solving must be between 0-100'),
    body('overallPerformance').isInt({ min: 0, max: 100 }).withMessage('Overall performance must be between 0-100'),
    body('comments').isLength({ min: 50 }).withMessage('Comments must be at least 50 characters'),
    body('recommendation').isIn(['Highly Recommended', 'Recommended', 'Recommended with Reservations', 'Not Recommended']).withMessage('Invalid recommendation')
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

      const {
        applicationId,
        grade,
        technicalSkills,
        communication,
        professionalism,
        problemSolving,
        overallPerformance,
        comments,
        strengths,
        areasForImprovement,
        recommendation
      } = req.body;

      // Find the application
      const application = await Application.findById(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Verify this advisor is assigned to this application
      if (application.assignedAdvisor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this application'
        });
      }

      // Check if evaluation already exists
      const existingEvaluation = await Evaluation.findOne({ application: applicationId });
      if (existingEvaluation) {
        return res.status(400).json({
          success: false,
          message: 'Evaluation already submitted for this application'
        });
      }

      // Create evaluation
      const evaluation = new Evaluation({
        student: application.student,
        advisor: req.user._id,
        application: applicationId,
        grade,
        technicalSkills,
        communication,
        professionalism,
        problemSolving,
        overallPerformance,
        comments,
        strengths,
        areasForImprovement,
        recommendation
      });

      await evaluation.save();

      res.status(201).json({
        success: true,
        message: 'Evaluation submitted successfully',
        evaluation
      });
    } catch (error) {
      console.error('Submit evaluation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   GET /api/evaluations/application/:applicationId
// @desc    Get evaluation by application ID
// @access  Private
router.get('/application/:applicationId', isAuthenticated, async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ application: req.params.applicationId })
      .populate('student', 'fullName email university department')
      .populate('advisor', 'fullName email');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Check permissions
    const isStudent = evaluation.student._id.toString() === req.user._id.toString();
    const isAdvisor = evaluation.advisor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';

    // Dean can view evaluations of students from their university
    let isDean = false;
    if (req.user.role === 'dean') {
      const student = await User.findById(evaluation.student._id);
      isDean = student.university === req.user.university && student.department === req.user.department;
    }

    if (!isStudent && !isAdvisor && !isAdmin && !isDean) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/evaluations/student/:studentId
// @desc    Get evaluation by student ID
// @access  Private
router.get('/student/:studentId', isAuthenticated, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ student: req.params.studentId })
      .populate('advisor', 'fullName email')
      .populate('application')
      .sort({ createdAt: -1 });

    if (!evaluations || evaluations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No evaluations found for this student'
      });
    }

    // Check permissions
    const isStudent = req.params.studentId === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';

    // Dean can view evaluations of students from their university
    let isDean = false;
    if (req.user.role === 'dean') {
      const student = await User.findById(req.params.studentId);
      isDean = student.university === req.user.university && student.department === req.user.department;
    }

    if (!isStudent && !isAdmin && !isDean) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      count: evaluations.length,
      evaluations
    });
  } catch (error) {
    console.error('Get student evaluations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/evaluations/:id
// @desc    Update evaluation (Advisor only)
// @access  Private (Advisor)
router.put('/:id', isAuthenticated, isAdvisor, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Verify this advisor created this evaluation
    if (evaluation.advisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own evaluations'
      });
    }

    // Update fields
    const allowedUpdates = [
      'grade', 'technicalSkills', 'communication', 'professionalism',
      'problemSolving', 'overallPerformance', 'comments', 'strengths',
      'areasForImprovement', 'recommendation'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        evaluation[field] = req.body[field];
      }
    });

    await evaluation.save();

    res.json({
      success: true,
      message: 'Evaluation updated successfully',
      evaluation
    });
  } catch (error) {
    console.error('Update evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
