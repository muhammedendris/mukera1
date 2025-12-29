const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const Application = require('../models/Application');
const { isAuthenticated, isStudent } = require('../middleware/auth');
const { uploadReport, handleMulterError } = require('../config/cloudinary');

// @route   POST /api/reports
// @desc    Upload weekly report (Student only)
// @access  Private (Student)
router.post(
  '/',
  isAuthenticated,
  isStudent,
  uploadReport,
  handleMulterError,
  [
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('weekNumber').isInt({ min: 1 }).withMessage('Week number must be at least 1'),
    body('title').notEmpty().withMessage('Report title is required'),
    body('description').isLength({ min: 50 }).withMessage('Description must be at least 50 characters')
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Report file is required'
        });
      }

      const { applicationId, weekNumber, title, description } = req.body;

      // Find the application
      const application = await Application.findById(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Verify this is the student's application
      if (application.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only upload reports for your own application'
        });
      }

      // Check if report for this week already exists
      const existingReport = await Report.findOne({
        application: applicationId,
        weekNumber: parseInt(weekNumber)
      });

      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: `Report for week ${weekNumber} already exists`
        });
      }

      // Create report
      const report = new Report({
        student: req.user._id,
        application: applicationId,
        weekNumber: parseInt(weekNumber),
        title,
        description,
        filePath: req.file.path // Cloudinary returns full URL
      });

      await report.save();

      // Update application progress
      // Count total reports submitted for this application
      const totalReports = await Report.countDocuments({ application: applicationId });

      // Calculate progress percentage
      const progressPercentage = Math.min(
        Math.round((totalReports / application.internshipDurationWeeks) * 100),
        100
      );

      // Update the application's currentProgress
      application.currentProgress = progressPercentage;
      await application.save();

      res.status(201).json({
        success: true,
        message: 'Report uploaded successfully',
        report,
        currentProgress: progressPercentage
      });
    } catch (error) {
      console.error('Upload report error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/reports/:id
// @desc    Update/Replace existing report (Student only)
// @access  Private (Student)
router.put(
  '/:id',
  isAuthenticated,
  isStudent,
  uploadReport,
  handleMulterError,
  [
    body('title').optional().notEmpty().withMessage('Report title is required'),
    body('description').optional().isLength({ min: 50 }).withMessage('Description must be at least 50 characters')
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

      const { id } = req.params;
      const { title, description } = req.body;

      // Find the existing report
      const report = await Report.findById(id).populate('application');

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Verify this is the student's report
      if (report.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own reports'
        });
      }

      // Update fields if provided
      if (title) report.title = title;
      if (description) report.description = description;

      // If a new file is uploaded, replace the old one
      if (req.file) {
        // Delete old file from filesystem
        const fs = require('fs');
        const path = require('path');

        if (report.filePath && fs.existsSync(report.filePath)) {
          try {
            fs.unlinkSync(report.filePath);
            console.log(`✅ Deleted old report file: ${report.filePath}`);
          } catch (err) {
            console.error('Failed to delete old file:', err);
          }
        }

        // Update with new file path (Cloudinary URL)
        report.filePath = req.file.path;
      }

      // Update upload date to reflect the change
      report.uploadDate = new Date();

      await report.save();

      res.json({
        success: true,
        message: 'Report updated successfully',
        report
      });
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   GET /api/reports/application/:applicationId
// @desc    Get all reports for an application
// @access  Private
router.get('/application/:applicationId', isAuthenticated, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isStudent = application.student.toString() === req.user._id.toString();
    const isAdvisor = application.assignedAdvisor &&
                      application.assignedAdvisor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';

    if (!isStudent && !isAdvisor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const reports = await Report.find({ application: req.params.applicationId })
      .populate('student', 'fullName email')
      .sort({ weekNumber: 1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reports/student/:studentId
// @desc    Get all reports for a student
// @access  Private
router.get('/student/:studentId', isAuthenticated, async (req, res) => {
  try {
    // Check permissions
    const isOwnReports = req.params.studentId === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';

    if (!isOwnReports && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const reports = await Report.find({ student: req.params.studentId })
      .populate('application')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get single report by ID
// @access  Private
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('student', 'fullName email')
      .populate('application');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    const application = await Application.findById(report.application._id);
    const isStudent = report.student._id.toString() === req.user._id.toString();
    const isAdvisor = application.assignedAdvisor &&
                      application.assignedAdvisor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';

    if (!isStudent && !isAdvisor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/reports/:id/feedback
// @desc    Add advisor feedback to report (Advisor only)
// @access  Private (Advisor)
router.patch('/:id/feedback', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'advisor') {
      return res.status(403).json({
        success: false,
        message: 'Only advisors can provide feedback'
      });
    }

    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback is required'
      });
    }

    const report = await Report.findById(req.params.id).populate('application');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Verify this advisor is assigned to this report's application
    const application = await Application.findById(report.application._id);
    if (application.assignedAdvisor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this student'
      });
    }

    report.advisorFeedback = feedback;
    report.reviewed = true;
    report.reviewedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: 'Feedback added successfully',
      report
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
