const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
  type: String,
  // 'admin' የሚለውን መጨረሻ ላይ ጨምርበት
  enum: ['student', 'dean', 'company-admin', 'advisor', 'Admin'], 
  required: true
},
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  university: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'dean';
    },
    trim: true
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'dean';
    },
    trim: true
  },
  idCardPath: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'dean';
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Password Reset OTP Fields
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordOTPExpires: {
    type: Date,
    select: false
  },
  // Email Verification OTP Fields
  emailVerificationOTP: {
    type: String,
    select: false
  },
  emailVerificationOTPExpires: {
    type: Date,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Performance indexes for faster queries
userSchema.index({ email: 1 }); // For login and email lookups
userSchema.index({ role: 1, isVerified: 1 }); // For role-based queries
userSchema.index({ university: 1, department: 1 }); // For dean queries

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to get user without sensitive data
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Generate Password Reset OTP
userSchema.methods.generatePasswordResetOTP = function() {
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP and expiration (10 minutes from now)
  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Clear Password Reset OTP
userSchema.methods.clearPasswordResetOTP = function() {
  this.resetPasswordOTP = undefined;
  this.resetPasswordOTPExpires = undefined;
};

// Generate Email Verification OTP
userSchema.methods.generateEmailVerificationOTP = function() {
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP and expiration (10 minutes from now)
  this.emailVerificationOTP = otp;
  this.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Clear Email Verification OTP
userSchema.methods.clearEmailVerificationOTP = function() {
  this.emailVerificationOTP = undefined;
  this.emailVerificationOTPExpires = undefined;
};

module.exports = mongoose.model('User', userSchema);
