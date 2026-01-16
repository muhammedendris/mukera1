const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  // Singleton identifier - only one document should exist
  _id: {
    type: String,
    default: 'system_config',
    immutable: true
  },

  // Registration date range
  registrationStartDate: {
    type: Date,
    required: true,
    default: () => new Date() // Default to current date
  },

  registrationEndDate: {
    type: Date,
    required: true,
    default: () => {
      // Default to 3 months from now
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date;
    }
  },

  // Maximum number of students allowed
  maxStudents: {
    type: Number,
    required: true,
    default: 100,
    min: 1
  },

  // Manual override switch
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },

  // Additional metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get the singleton instance (create if doesn't exist)
systemSettingSchema.statics.getInstance = async function() {
  let settings = await this.findById('system_config');

  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      _id: 'system_config',
      registrationStartDate: new Date(),
      registrationEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      maxStudents: 100,
      isRegistrationOpen: true
    });
    console.log('✅ Default system settings created');
  }

  return settings;
};

// Method to check if registration is currently allowed
systemSettingSchema.methods.canRegister = async function() {
  const now = new Date();

  // Check manual override first
  if (!this.isRegistrationOpen) {
    return {
      allowed: false,
      reason: 'Registration is currently closed by administrator'
    };
  }

  // Check date range
  if (now < this.registrationStartDate) {
    return {
      allowed: false,
      reason: `Registration will open on ${this.registrationStartDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`
    };
  }

  if (now > this.registrationEndDate) {
    return {
      allowed: false,
      reason: `Registration closed on ${this.registrationEndDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`
    };
  }

  // Check student quota
  const User = mongoose.model('User');
  const studentCount = await User.countDocuments({
    role: 'student',
    isVerified: true // Only count verified students
  });

  if (studentCount >= this.maxStudents) {
    return {
      allowed: false,
      reason: `Maximum student capacity (${this.maxStudents}) has been reached`
    };
  }

  // Registration is allowed
  return {
    allowed: true,
    currentStudents: studentCount,
    maxStudents: this.maxStudents,
    remainingSlots: this.maxStudents - studentCount
  };
};

// Prevent multiple documents (singleton pattern)
systemSettingSchema.pre('save', function(next) {
  if (this._id !== 'system_config') {
    const error = new Error('Only one SystemSetting document is allowed');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
