const { sendContactEmail } = require('../utils/sendEmail');

// @desc    Send contact form email to admin
// @route   POST /api/contact/send-email
// @access  Public
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate inputs
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate message length
    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      });
    }

    // Send email to admin
    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        message: message.trim()
      });

      console.log(`✅ Contact form submitted by: ${name} <${email}>`);

      res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.'
      });

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);

      return res.status(500).json({
        success: false,
        message: 'Failed to send your message. Please try again later or contact us directly.'
      });
    }

  } catch (error) {
    console.error('❌ Error in sendContactEmail controller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
