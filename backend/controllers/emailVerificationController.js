const User = require('../models/User');
const { sendRegistrationOTP } = require('../utils/sendEmail');

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-verification-otp
// @access  Public
exports.resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in now.'
      });
    }

    // Generate new OTP
    const otp = user.generateEmailVerificationOTP();

    // Save user with OTP
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await sendRegistrationOTP(user.email, otp, user.fullName);

      console.log(`Email verification OTP resent to ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Verification code has been sent to your email'
      });
    } catch (emailError) {
      // If email fails, clear OTP and return error
      user.clearEmailVerificationOTP();
      await user.save({ validateBeforeSave: false });

      console.error('Email sending failed:', emailError);

      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Error in resendVerificationOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmailWithOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    // Find user with OTP fields selected
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+emailVerificationOTP +emailVerificationOTPExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in now.'
      });
    }

    // Check if OTP exists
    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification request found. Please request a new code.'
      });
    }

    // Check if OTP has expired
    if (Date.now() > user.emailVerificationOTPExpires) {
      // Clear expired OTP
      user.clearEmailVerificationOTP();
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify OTP matches
    if (user.emailVerificationOTP !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    // OTP is valid - verify email
    user.isEmailVerified = true;
    user.clearEmailVerificationOTP();

    await user.save({ validateBeforeSave: false });

    console.log(`Email successfully verified for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Error in verifyEmailWithOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
