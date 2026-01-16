const express = require('express');
const router = express.Router();
const { getStatisticalReports } = require('../controllers/adminController');
const {
  updateSettings,
  getRegistrationStats
} = require('../controllers/settingsController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// @route   GET /api/admin/reports
// @desc    Get statistical reports
// @access  Private (Admin only)
router.get('/reports', isAuthenticated, isAdmin, getStatisticalReports);

// @route   PUT /api/admin/settings
// @desc    Update system settings (registration control)
// @access  Private (Admin only)
router.put('/settings', isAuthenticated, isAdmin, updateSettings);

// @route   GET /api/admin/settings/stats
// @desc    Get detailed registration statistics
// @access  Private (Admin only)
router.get('/settings/stats', isAuthenticated, isAdmin, getRegistrationStats);

module.exports = router;
