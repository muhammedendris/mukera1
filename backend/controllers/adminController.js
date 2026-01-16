const Application = require('../models/Application');
const Evaluation = require('../models/Evaluation');

// @desc    Get statistical reports for admin
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getStatisticalReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date format
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Total Applications within date range
    const totalApplications = await Application.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Rejected Applications
    const rejectedApplications = await Application.countDocuments({
      status: 'rejected',
      createdAt: { $gte: start, $lte: end }
    });

    // Active Interns (accepted status)
    const activeInterns = await Application.countDocuments({
      status: 'accepted',
      createdAt: { $gte: start, $lte: end }
    });

    // Completed Internships
    // Method 1: Applications with status 'completed'
    const completedByStatus = await Application.countDocuments({
      status: 'completed',
      createdAt: { $gte: start, $lte: end }
    });

    // Method 2: Applications with evaluations
    const applicationsWithEvaluations = await Application.find({
      createdAt: { $gte: start, $lte: end }
    }).select('_id');

    const applicationIds = applicationsWithEvaluations.map(app => app._id);

    const evaluatedApplications = await Evaluation.countDocuments({
      application: { $in: applicationIds }
    });

    // Total completed: either status is completed OR has evaluation (avoid double counting)
    const completedApplicationIds = await Application.find({
      status: 'completed',
      createdAt: { $gte: start, $lte: end }
    }).select('_id');

    const completedIds = new Set(completedApplicationIds.map(app => app._id.toString()));

    const evaluationsForNonCompleted = await Evaluation.find({
      application: { $in: applicationIds },
      application: { $nin: completedApplicationIds }
    }).countDocuments();

    const totalCompleted = completedByStatus + evaluationsForNonCompleted;

    // Additional statistics
    const pendingApplications = await Application.countDocuments({
      status: 'pending',
      createdAt: { $gte: start, $lte: end }
    });

    // Get applications by department
    const departmentStats = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: {
          path: '$studentInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$studentInfo.department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get applications by university
    const universityStats = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: {
          path: '$studentInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$studentInfo.university',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        dateRange: {
          startDate: start,
          endDate: end
        },
        statistics: {
          totalApplications,
          rejectedApplications,
          activeInterns,
          completedInternships: totalCompleted,
          pendingApplications
        },
        breakdown: {
          byDepartment: departmentStats.map(stat => ({
            department: stat._id || 'Unknown',
            count: stat.count
          })),
          byUniversity: universityStats.map(stat => ({
            university: stat._id || 'Unknown',
            count: stat.count
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reports',
      error: error.message
    });
  }
};
