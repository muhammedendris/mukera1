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
      let sender, receiver, isPendingAdvisorAssignment = false;
      if (isStudent) {
        sender = application.student._id;

        // KEY CHANGE: Allow null receiver if no advisor assigned
        if (application.assignedAdvisor) {
          receiver = application.assignedAdvisor._id;
        } else {
          receiver = null;
          isPendingAdvisorAssignment = true;
        }
      } else {
        // Advisor sending message
        sender = application.assignedAdvisor._id;
        receiver = application.student._id;
      }

      // Create chat message
      const chat = new Chat({
        application: applicationId,
        sender,
        receiver,
        message,
        isPendingAdvisorAssignment
      });

      await chat.save();

      // Populate sender and receiver details
      await chat.populate('sender', 'fullName role');
      if (chat.receiver) {
        await chat.populate('receiver', 'fullName role');
      }

      // Emit real-time message via Socket.io
      const io = req.app.get('io');
      io.to(`chat-${applicationId}`).emit('new-message', chat);

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

// @route   DELETE /api/chats/:applicationId
// @desc    Clear all messages for an application (PERMANENT)
// @access  Private (Student or Advisor)
router.delete('/:applicationId', isAuthenticated, async (req, res) => {
  try {
    const { applicationId } = req.params;

    console.log('\n🗑️ ========================================');
    console.log('CLEAR CHAT REQUEST');
    console.log('========================================');
    console.log('Application ID:', applicationId);
    console.log('User:', req.user.fullName, `(${req.user.role})`);

    // Find the application
    const application = await Application.findById(applicationId);

    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify user is part of this application
    const isStudent = req.user._id.toString() === application.student.toString();
    const isAdvisor = application.assignedAdvisor &&
                      req.user._id.toString() === application.assignedAdvisor.toString();

    // Allow student to clear even without advisor, or allow advisor to clear
    if (!isStudent && !isAdvisor) {
      console.log('❌ Access denied - User not authorized');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Count messages before deletion
    const messageCount = await Chat.countDocuments({ application: applicationId });
    console.log(`📊 Found ${messageCount} messages to delete`);

    // Delete all messages for this application
    const deleteResult = await Chat.deleteMany({ application: applicationId });
    console.log(`✅ Deleted ${deleteResult.deletedCount} messages`);

    // Emit real-time clear chat event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`chat-${applicationId}`).emit('chat-cleared', {
        applicationId,
        clearedBy: req.user.fullName,
        timestamp: new Date()
      });
      console.log('📡 Socket.io event emitted: chat-cleared');
    } else {
      console.log('⚠️ Socket.io not available - skipping real-time event');
    }
    console.log('========================================\n');

    res.json({
      success: true,
      message: 'Chat cleared successfully',
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('❌ Clear chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
