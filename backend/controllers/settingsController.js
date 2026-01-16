const SystemSetting = require('../models/SystemSetting');
const User = require('../models/User');

// @desc    Get system settings (public endpoint)
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      FETCHING SYSTEM SETTINGS          ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Get singleton instance
    const settings = await SystemSetting.getInstance();

    // Check if registration is allowed
    const registrationStatus = await settings.canRegister();

    // Get current student count
    const studentCount = await User.countDocuments({
      role: 'student',
      isVerified: true
    });

    const responseData = {
      registrationStartDate: settings.registrationStartDate,
      registrationEndDate: settings.registrationEndDate,
      maxStudents: settings.maxStudents,
      currentStudents: studentCount,
      remainingSlots: Math.max(0, settings.maxStudents - studentCount),
      isRegistrationOpen: settings.isRegistrationOpen,
      canRegister: registrationStatus.allowed,
      message: registrationStatus.reason || 'Registration is open'
    };

    console.log('📊 Settings Status:');
    console.log(`   Registration: ${responseData.canRegister ? '✅ OPEN' : '❌ CLOSED'}`);
    console.log(`   Current Students: ${studentCount}/${settings.maxStudents}`);
    console.log(`   Date Range: ${settings.registrationStartDate.toLocaleDateString()} - ${settings.registrationEndDate.toLocaleDateString()}`);
    console.log('');

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
};

// @desc    Update system settings (admin only)
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      UPDATING SYSTEM SETTINGS          ║');
    console.log('╚════════════════════════════════════════╝\n');

    const {
      registrationStartDate,
      registrationEndDate,
      maxStudents,
      isRegistrationOpen
    } = req.body;

    // Get singleton instance
    const settings = await SystemSetting.getInstance();

    console.log('📋 Update Request:');
    if (registrationStartDate) console.log(`   Start Date: ${new Date(registrationStartDate).toLocaleDateString()}`);
    if (registrationEndDate) console.log(`   End Date: ${new Date(registrationEndDate).toLocaleDateString()}`);
    if (maxStudents) console.log(`   Max Students: ${maxStudents}`);
    if (isRegistrationOpen !== undefined) console.log(`   Manual Override: ${isRegistrationOpen ? 'OPEN' : 'CLOSED'}`);

    // Validate dates
    if (registrationStartDate && registrationEndDate) {
      const start = new Date(registrationStartDate);
      const end = new Date(registrationEndDate);

      if (start >= end) {
        console.log('❌ Invalid date range: start date must be before end date');
        return res.status(400).json({
          success: false,
          message: 'Start date must be before end date'
        });
      }
    }

    // Validate maxStudents
    if (maxStudents !== undefined) {
      const currentStudents = await User.countDocuments({
        role: 'student',
        isVerified: true
      });

      if (maxStudents < currentStudents) {
        console.log(`❌ Invalid quota: Cannot set max students (${maxStudents}) below current count (${currentStudents})`);
        return res.status(400).json({
          success: false,
          message: `Cannot set maximum students below current student count (${currentStudents})`
        });
      }
    }

    // Update fields
    if (registrationStartDate) settings.registrationStartDate = new Date(registrationStartDate);
    if (registrationEndDate) settings.registrationEndDate = new Date(registrationEndDate);
    if (maxStudents) settings.maxStudents = maxStudents;
    if (isRegistrationOpen !== undefined) settings.isRegistrationOpen = isRegistrationOpen;

    settings.lastUpdatedBy = req.user.id;
    settings.updatedAt = new Date();

    await settings.save();

    console.log('✅ Settings updated successfully');
    console.log('');

    // Get updated registration status
    const registrationStatus = await settings.canRegister();
    const studentCount = await User.countDocuments({
      role: 'student',
      isVerified: true
    });

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: {
        registrationStartDate: settings.registrationStartDate,
        registrationEndDate: settings.registrationEndDate,
        maxStudents: settings.maxStudents,
        currentStudents: studentCount,
        remainingSlots: Math.max(0, settings.maxStudents - studentCount),
        isRegistrationOpen: settings.isRegistrationOpen,
        canRegister: registrationStatus.allowed,
        statusMessage: registrationStatus.reason || 'Registration is open',
        lastUpdatedBy: settings.lastUpdatedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings',
      error: error.message
    });
  }
};

// @desc    Get registration statistics (admin only)
// @route   GET /api/admin/settings/stats
// @access  Private/Admin
exports.getRegistrationStats = async (req, res) => {
  try {
    const settings = await SystemSetting.getInstance();

    // Get detailed student statistics
    const totalStudents = await User.countDocuments({ role: 'student' });
    const verifiedStudents = await User.countDocuments({
      role: 'student',
      isVerified: true
    });
    const pendingStudents = await User.countDocuments({
      role: 'student',
      isVerified: false
    });

    const registrationStatus = await settings.canRegister();

    res.json({
      success: true,
      data: {
        settings: {
          registrationStartDate: settings.registrationStartDate,
          registrationEndDate: settings.registrationEndDate,
          maxStudents: settings.maxStudents,
          isRegistrationOpen: settings.isRegistrationOpen
        },
        statistics: {
          totalStudents,
          verifiedStudents,
          pendingStudents,
          remainingSlots: Math.max(0, settings.maxStudents - verifiedStudents),
          capacityPercentage: Math.round((verifiedStudents / settings.maxStudents) * 100)
        },
        status: {
          canRegister: registrationStatus.allowed,
          message: registrationStatus.reason || 'Registration is open'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching registration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration statistics',
      error: error.message
    });
  }
};
