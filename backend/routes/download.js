const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');

// Helper function to fetch and stream file from URL
const streamFile = (url, res, filename) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (fileResponse) => {
      if (fileResponse.statusCode !== 200) {
        reject(new Error(`Failed to fetch file: ${fileResponse.statusCode}`));
        return;
      }

      // Get content type from response or default to octet-stream
      const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';

      // Set headers for download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      if (fileResponse.headers['content-length']) {
        res.setHeader('Content-Length', fileResponse.headers['content-length']);
      }

      // Pipe the file to response
      fileResponse.pipe(res);

      fileResponse.on('end', () => resolve());
      fileResponse.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
};

// @route   GET /api/download/acceptance-letter/:userId
// @desc    Download acceptance letter for a user
// @access  Private
router.get('/acceptance-letter/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only download their own acceptance letter (or admin/dean can download any)
    if (req.user._id.toString() !== userId &&
        req.user.role !== 'company-admin' &&
        req.user.role !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.acceptanceLetterPath) {
      return res.status(404).json({
        success: false,
        message: 'No acceptance letter found'
      });
    }

    // Generate filename
    const ext = user.acceptanceLetterPath.split('.').pop() || 'pdf';
    const filename = `acceptance-letter-${user.fullName.replace(/\s+/g, '-')}.${ext}`;

    await streamFile(user.acceptanceLetterPath, res, filename);

  } catch (error) {
    console.error('Download acceptance letter error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
});

// @route   GET /api/download/attachment/:applicationId
// @desc    Download CV/Resume attachment for an application
// @access  Private
router.get('/attachment/:applicationId', isAuthenticated, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('student');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isOwner = application.student._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'company-admin';
    const isAssignedAdvisor = application.assignedAdvisor &&
                              application.assignedAdvisor.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isAssignedAdvisor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!application.attachmentPath) {
      return res.status(404).json({
        success: false,
        message: 'No attachment found'
      });
    }

    // Generate filename
    const ext = application.attachmentPath.split('.').pop() || 'pdf';
    const studentName = application.student.fullName.replace(/\s+/g, '-');
    const filename = `CV-${studentName}.${ext}`;

    await streamFile(application.attachmentPath, res, filename);

  } catch (error) {
    console.error('Download attachment error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
});

// @route   GET /api/download/id-card/:userId
// @desc    Download ID card for a user (Admin/Dean only)
// @access  Private (Admin/Dean)
router.get('/id-card/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admin or dean can download ID cards
    if (req.user.role !== 'company-admin' && req.user.role !== 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.idCardPath) {
      return res.status(404).json({
        success: false,
        message: 'No ID card found'
      });
    }

    // Generate filename
    const ext = user.idCardPath.split('.').pop() || 'png';
    const filename = `id-card-${user.fullName.replace(/\s+/g, '-')}.${ext}`;

    await streamFile(user.idCardPath, res, filename);

  } catch (error) {
    console.error('Download ID card error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
});

module.exports = router;
