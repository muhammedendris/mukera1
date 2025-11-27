const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Application = require('../models/Application');
const { isAuthenticated } = require('../middleware/auth');

// @route   POST /api/chats
// @desc    Send a message (Student or Advisor)
// @access  Private
router.post(
  '/',
  isAuthenticated,
  [
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('message').notEmpty().withMessage('Message cannot be empty')
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

      const { applicationId, message } = req.body;

      // Find the application
      const application = await Application.findById(applicationId)
        .populate('student')
        .populate('assignedAdvisor');

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Verify user is part of this application (student or assigned advisor)
      const isStudent = req.user._id.toString() === application.student._id.toString();
      const isAdvisor = application.assignedAdvisor &&
                        req.user._id.toString() === application.assignedAdvisor._id.toString();

      if (!isStudent && !isAdvisor) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to send messages for this application'
        });
      }

      // Determine sender and receiver
      let sender, receiver;
      if (isStudent) {
        sender = application.student._id;
        receiver = application.assignedAdvisor._id;
      } else {
        sender = application.assignedAdvisor._id;
        receiver = application.student._id;
      }

      // Create chat message
      const chat = new Chat({
        application: applicationId,
        sender,
        receiver,
        message
      });

      await chat.save();

      // Populate sender and receiver details
      await chat.populate('sender', 'fullName role');
      await chat.populate('receiver', 'fullName role');

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        chat
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @route   GET /api/chats/:applicationId
// @desc    Get chat history for an application
// @access  Private
router.get('/:applicationId', isAuthenticated, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify user is part of this application
    const isStudent = req.user._id.toString() === application.student.toString();
    const isAdvisor = application.assignedAdvisor &&
                      req.user._id.toString() === application.assignedAdvisor.toString();

    if (!isStudent && !isAdvisor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get all messages for this application
    const chats = await Chat.find({ application: applicationId })
      .populate('sender', 'fullName role')
      .populate('receiver', 'fullName role')
      .sort({ timestamp: 1 });

    // Mark messages as read if user is the receiver
    await Chat.updateMany(
      {
        application: applicationId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/chats/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    const unreadCount = await Chat.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
