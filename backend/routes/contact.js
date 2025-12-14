const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');

// POST /api/contact/send-email - Send contact form email to admin
router.post('/send-email', sendContactEmail);

module.exports = router;
