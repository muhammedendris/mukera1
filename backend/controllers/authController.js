const User = require('../models/User');
const { sendRegistrationOTP } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * @desc    Register a new user (Student or Dean)
 * @route   POST /api/auth/register
 * @access  Public
 *
 * This function handles user registration with the following steps:
 * 1. Validates input data
 * 2. Checks if user already exists
 * 3. Creates new user account
 * 4. Generates 6-digit OTP for email verification
 * 5. Sends OTP via email
 * 6. Returns success response
 */
const registerUser = async (req, res) => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     USER REGISTRATION INITIATED        ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const { email, password, fullName, role, university, department, phone, address } = req.body;

    console.log('📋 Registration Data Received:');
    console.log('   Email:', email);
    console.log('   Full Name:', fullName);
    console.log('   Role:', role);
    console.log('   University:', university);
    console.log('   Department:', department);

    // Step 1: Validate required fields
    if (!email || !password || !fullName || !role) {
      console.log('❌ Validation Failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, fullName, and role'
      });
    }

    // Step 2: Check if ID card was uploaded (required for students and deans)
    if ((role === 'student' || role === 'dean') && (!req.files || !req.files.idCard)) {
      console.log('❌ Validation Failed: ID card not uploaded');
      return res.status(400).json({
        success: false,
        message: 'ID card upload is required'
      });
    }

    // Step 2.5: Check if live photo was uploaded (required for deans only)
    if (role === 'dean' && (!req.files || !req.files.livePhoto)) {
      console.log('❌ Validation Failed: Live photo not uploaded for dean');
      return res.status(400).json({
        success: false,
        message: 'Live photo capture is required for dean registration'
      });
    }

    // Step 3: Check if user already exists
    console.log('\n🔍 Checking if user already exists...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log('❌ User already exists with this email');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.log('✅ Email is available');

    // Step 4: Create new user object
    console.log('\n👤 Creating new user...');
    const userData = {
      email: email.toLowerCase(),
      password,
      fullName,
      role,
      isVerified: false,
      isEmailVerified: false
    };

    // Add optional fields if provided
    if (university) userData.university = university;
    if (department) userData.department = department;
    if (phone) userData.phone = phone;
    if (address) userData.address = address;

    // Add ID card path if uploaded (Cloudinary URL)
    if (req.files && req.files.idCard && req.files.idCard[0]) {
      userData.idCardPath = req.files.idCard[0].path; // Cloudinary returns full URL in path
    }

    // Add live photo path if uploaded (for deans) - Cloudinary URL
    if (req.files && req.files.livePhoto && req.files.livePhoto[0]) {
      userData.livePhotoPath = req.files.livePhoto[0].path; // Cloudinary returns full URL in path
    }

    const user = new User(userData);

    // Step 5: Generate 6-digit OTP for email verification
    console.log('\n🔐 Generating OTP for email verification...');
    const otp = user.generateEmailVerificationOTP();
    console.log(`✅ OTP Generated: ${otp}`);
    console.log(`⏰ OTP Expires At: ${new Date(user.emailVerificationOTPExpires).toLocaleString()}`);

    // Step 6: Save user to database
    console.log('\n💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully to database');
    console.log('   User ID:', user._id);

    // Step 7: Send OTP email
    console.log('\n📧 Initiating email sending process...');
    try {
      const emailResult = await sendRegistrationOTP(user.email, otp, user.fullName);

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║   REGISTRATION COMPLETED SUCCESSFULLY  ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('✅ User registered:', user.email);
      console.log('✅ Email sent with OTP');
      console.log('✅ Message ID:', emailResult.messageId);
      console.log('\n');

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for verification code.',
        email: user.email,
        userId: user._id
      });

    } catch (emailError) {
      // If email fails, log detailed error but still return partial success
      console.error('\n╔════════════════════════════════════════╗');
      console.error('║       EMAIL SENDING FAILED             ║');
      console.error('╚════════════════════════════════════════╝');
      console.error('Error Details:', emailError.message);
      console.error('\n⚠️  User was saved to database but email failed');
      console.error('    User can use "Resend OTP" feature\n');

      return res.status(201).json({
        success: true,
        message: 'Registration successful, but failed to send verification email. Please use the "Resend Code" option.',
        email: user.email,
        userId: user._id,
        emailError: true
      });
    }

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║     REGISTRATION ERROR OCCURRED        ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('\n');

    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║         USER LOGIN INITIATED           ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const { email, password } = req.body;

    console.log('📋 Login Data Received:');
    console.log('   Email:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Validation Failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    console.log('\n🔍 Finding user in database...');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', user.email);

    // Check password
    console.log('\n🔐 Verifying password...');
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Password is correct');

    // Check if email is verified
    console.log('\n📧 Checking email verification status...');
    if (!user.isEmailVerified) {
      console.log('⚠️  Email not verified');
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the verification code.',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    console.log('✅ Email is verified');

    // Check if dean account is verified (deans can't login until verified by admin)
    if (user.role === 'dean' && !user.isVerified) {
      console.log('⚠️  Dean account pending admin verification');
      return res.status(403).json({
        success: false,
        message: 'Your account is pending verification by the Company Admin. Please wait for approval.'
      });
    }

    // Generate token
    console.log('\n🎟️  Generating JWT token...');
    const token = generateToken(user._id);
    console.log('✅ Token generated successfully');

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      LOGIN COMPLETED SUCCESSFULLY      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('✅ User logged in:', user.email);
    console.log('✅ Role:', user.role);
    console.log('\n');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║        LOGIN ERROR OCCURRED            ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('\n');

    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  generateToken
};
