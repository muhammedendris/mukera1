const User = require('../models/User');
const { sendPasswordResetOTP } = require('../services/emailService');

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.requestPasswordReset = async (req, res) => {
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

    // Always return success message (don't reveal if email exists)
    const successMessage = 'If an account with that email exists, a password reset code has been sent.';

    // If user doesn't exist, still return success (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage
      });
    }

    // Generate OTP
    const otp = user.generatePasswordResetOTP();

    // Save user with OTP
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      await sendPasswordResetOTP(user.email, otp, user.fullName);

      console.log(`Password reset OTP sent to ${user.email}`);

      res.status(200).json({
        success: true,
        message: successMessage
      });
    } catch (emailError) {
      // If email fails, clear OTP and return error
      user.clearPasswordResetOTP();
      await user.save({ validateBeforeSave: false });

      console.error('Email sending failed:', emailError);

      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP code, and new password'
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user with OTP fields selected
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+resetPasswordOTP +resetPasswordOTPExpires +password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code'
      });
    }

    // Check if OTP exists
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found. Please request a new OTP.'
      });
    }

    // Check if OTP has expired
    if (Date.now() > user.resetPasswordOTPExpires) {
      // Clear expired OTP
      user.clearPasswordResetOTP();
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP matches
    if (user.resetPasswordOTP !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.'
      });
    }

    // OTP is valid - update password
    user.password = newPassword;
    user.clearPasswordResetOTP();

    // Save user (password will be hashed by pre-save hook)
    await user.save({ validateBeforeSave: false });

    console.log(`Password successfully reset for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Error in resetPasswordWithOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
