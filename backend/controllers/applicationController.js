const Application = require('../models/Application');
const User = require('../models/User');
const { sendApplicationAcceptedEmail, sendApplicationRejectedEmail } = require('../utils/sendEmail');

/**
 * @desc    Update student application status (Accept or Reject) with automated email notification
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Admin only)
 * @param   {string} req.params.id - Application ID
 * @param   {string} req.body.status - New status ('accepted' or 'rejected')
 * @param   {string} req.body.rejectionReason - Reason for rejection (required if status is 'rejected')
 */
const updateStudentStatus = async (req, res) => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   APPLICATION STATUS UPDATE INITIATED  ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const { status, rejectionReason } = req.body;
    const applicationId = req.params.id;

    console.log('📋 Status Update Data Received:');
    console.log('   Application ID:', applicationId);
    console.log('   New Status:', status);
    console.log('   Rejection Reason:', rejectionReason || 'N/A');

    // Step 1: Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      console.log('❌ Validation Failed: Invalid status');
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

    // Step 2: Validate rejection reason if status is rejected
    if (status === 'rejected' && !rejectionReason) {
      console.log('❌ Validation Failed: Rejection reason is required');
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an application'
      });
    }

    // Step 3: Find the application and populate student data
    console.log('\n🔍 Finding application in database...');
    const application = await Application.findById(applicationId).populate('student', 'email fullName');

    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('✅ Application found:', applicationId);

    // Check if student exists
    if (!application.student) {
      console.log('❌ Student data not found for this application');
      return res.status(404).json({
        success: false,
        message: 'Student data not found for this application. The student may have been deleted.'
      });
    }

    console.log('   Student:', application.student.fullName);
    console.log('   Current Status:', application.status);

    // Step 4: Check if application is already processed
    if (application.status !== 'pending') {
      console.log('❌ Application already processed');
      return res.status(400).json({
        success: false,
        message: `This application has already been ${application.status}. Current status: ${application.status}`
      });
    }

    // Step 5: Update application status
    console.log('\n📝 Updating application status...');
    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    if (status === 'rejected') {
      application.rejectionReason = rejectionReason;
    }

    if (status === 'accepted') {
      // Use existing internshipDurationWeeks from the application or set default
      if (!application.internshipDurationWeeks) {
        // Extract weeks from requestedDuration if available, otherwise default to 12 weeks
        const durationMatch = application.requestedDuration?.match(/(\d+)/);
        application.internshipDurationWeeks = durationMatch ? parseInt(durationMatch[1]) : 12;
      }
      application.currentProgress = 0; // Initialize progress to 0%
      console.log('   Duration (weeks):', application.internshipDurationWeeks);
    }

    await application.save();
    console.log('✅ Application status updated successfully');

    // Step 6: Send automated email notification
    console.log('\n📧 Sending email notification...');
    const studentEmail = application.student.email;
    const studentName = application.student.fullName;

    try {
      if (status === 'accepted') {
        console.log('   Type: Acceptance Email');
        await sendApplicationAcceptedEmail(studentEmail, studentName, application.internshipDurationWeeks);
        console.log('✅ Acceptance email sent successfully');
      } else if (status === 'rejected') {
        console.log('   Type: Rejection Email');
        await sendApplicationRejectedEmail(studentEmail, studentName, rejectionReason);
        console.log('✅ Rejection email sent successfully');
      }

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║  STATUS UPDATE COMPLETED SUCCESSFULLY  ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('✅ Application status:', status);
      console.log('✅ Student notified:', studentEmail);
      console.log('✅ Email sent successfully');
      console.log('\n');

      return res.json({
        success: true,
        message: `Application ${status} successfully. Email notification sent to ${studentEmail}`,
        application,
        emailSent: true
      });

    } catch (emailError) {
      // If email fails, log the error but still return success for status update
      console.error('\n╔════════════════════════════════════════╗');
      console.error('║       EMAIL SENDING FAILED             ║');
      console.error('╚════════════════════════════════════════╝');
      console.error('Error Details:', emailError.message);
      console.error('\n⚠️  Status updated but email failed to send');
      console.error('    Student may need to be notified manually\n');

      return res.json({
        success: true,
        message: `Application ${status} successfully, but failed to send email notification. Please notify the student manually.`,
        application,
        emailSent: false,
        emailError: emailError.message
      });
    }

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║     STATUS UPDATE ERROR OCCURRED       ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('\n');

    return res.status(500).json({
      success: false,
      message: 'Server error during status update. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get accepted students for Dean Dashboard
 * @route   GET /api/applications/accepted-students
 * @access  Private (Dean only)
 */
const getAcceptedStudents = async (req, res) => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   FETCHING ACCEPTED STUDENTS (DEAN)    ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const { university, department, role } = req.user;

    console.log('📋 Dean Info:');
    console.log('   University:', university);
    console.log('   Department:', department);

    // Only allow deans to access this endpoint
    if (role !== 'dean') {
      console.log('❌ Access denied: User is not a dean');
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is for deans only.'
      });
    }

    // Find all students from the dean's university and department
    console.log('\n🔍 Finding students from dean\'s department...');
    const students = await User.find({
      role: 'student',
      university: university,
      department: department,
      isVerified: true
    }).select('_id').lean();

    const studentIds = students.map(s => s._id);
    console.log(`✅ Found ${studentIds.length} verified students in this department`);

    // Find accepted applications for these students
    console.log('\n🔍 Finding accepted applications...');
    const acceptedApplications = await Application.find({
      student: { $in: studentIds },
      status: 'accepted'
    })
      .populate('student', 'fullName email department university _id')
      .populate('assignedAdvisor', 'fullName email')
      .select('companyName status requestedDuration internshipDurationWeeks currentProgress createdAt startDate endDate')
      .lean()
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${acceptedApplications.length} accepted applications`);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     ACCEPTED STUDENTS FETCH SUCCESS    ║');
    console.log('╚════════════════════════════════════════╝\n');

    res.json({
      success: true,
      count: acceptedApplications.length,
      students: acceptedApplications
    });

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║     ACCEPTED STUDENTS FETCH ERROR      ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('\n');

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching accepted students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  updateStudentStatus,
  getAcceptedStudents
};
