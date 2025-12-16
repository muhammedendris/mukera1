const express = require('express');
const router = express.Router();
const { getStudentProfile } = require('../controllers/advisorController');
const { isAuthenticated, isStudent } = require('../middleware/auth');

// @route   GET /api/students/profile
// @desc    Get student profile with advisor details
// @access  Private (Student)
router.get('/profile', isAuthenticated, isStudent, getStudentProfile);

module.exports = router;
