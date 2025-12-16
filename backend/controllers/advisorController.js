const Application = require('../models/Application');
const User = require('../models/User');
const Chat = require('../models/Chat');

/**
 * @desc    Assign advisor to student application (Admin only)
 * @route   PATCH /api/applications/:id/assign-advisor
 * @access  Private (Admin)
 * @param   {string} req.params.id - Application ID
 * @param   {string} req.body.advisorId - Advisor user ID
 */
const assignAdvisor = async (req, res) => {
  try {
    const applicationId = req.params.id; // Changed from req.params.applicationId
    const { advisorId } = req.body;

    // Validate advisor ID is provided
    if (!advisorId) {
      return res.status(400).json({
        success: false,
        message: 'Advisor ID is required'
      });
    }

    // Verify advisor exists and has correct role
    const advisor = await User.findOne({ _id: advisorId, role: 'advisor' });
    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: 'Advisor not found or invalid role'
      });
    }

    // Find and update application - NO STATUS VALIDATION
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { assignedAdvisor: advisorId },
      { new: true, runValidators: true } // { new: true } returns updated document
    )
    .populate('student', 'fullName email phone')
    .populate('assignedAdvisor', 'fullName email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update chat messages to assign receiver
    await Chat.updateMany(
      { application: applicationId, receiver: null },
      { $set: { receiver: advisorId, isPendingAdvisorAssignment: false } }
    );

    // Emit Socket.io event to notify connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(`chat-${applicationId}`).emit('advisor-assigned', {
        applicationId,
        advisorId,
        advisor: {
          _id: advisor._id,
          fullName: advisor.fullName,
          email: advisor.email,
          phone: advisor.phone
        }
      });
    }

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
};

/**
 * @desc    Get logged-in student's profile with assigned advisor details
 * @route   GET /api/students/profile
 * @access  Private (Student)
 */
const getStudentProfile = async (req, res) => {
  try {
    // req.user comes from isAuthenticated middleware
    const studentId = req.user._id;

    // Find student's accepted application with assigned advisor
    const application = await Application.findOne({
      student: studentId,
      status: 'accepted'
    })
    .populate('student', 'fullName email phone university department')
    .populate('assignedAdvisor', 'fullName email phone') // Include Name, Email, Phone
    .lean();

    if (!application) {
      // Student has no accepted application yet
      return res.json({
        success: true,
        message: 'No accepted application found',
        profile: {
          student: req.user,
          application: null,
          advisor: null
        }
      });
    }

    res.json({
      success: true,
      profile: {
        student: application.student,
        application: {
          _id: application._id,
          status: application.status,
          requestedDuration: application.requestedDuration,
          internshipDurationWeeks: application.internshipDurationWeeks,
          currentProgress: application.currentProgress
        },
        advisor: application.assignedAdvisor // Will be null if not assigned yet
      }
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  assignAdvisor,
  getStudentProfile
};
