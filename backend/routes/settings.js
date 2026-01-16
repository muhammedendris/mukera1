const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/settingsController');

// Public route - Anyone can check if registration is open
router.get('/', getSettings);

module.exports = router;
