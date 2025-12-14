const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    trim: true
  },
  requestedDuration: {
    type: String,
    required: [true, 'Internship duration is required'],
    trim: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    minlength: [100, 'Cover letter must be at least 100 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  assignedAdvisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  internshipDurationWeeks: {
    type: Number,
    min: [1, 'Internship duration must be at least 1 week']
  },
  currentProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Performance indexes for faster queries
applicationSchema.index({ student: 1, status: 1 }); // Existing index
applicationSchema.index({ status: 1, createdAt: -1 }); // For filtering by status and sorting
applicationSchema.index({ assignedAdvisor: 1, status: 1 }); // For advisor dashboard queries
applicationSchema.index({ student: 1 }); // For student lookups

module.exports = mongoose.model('Application', applicationSchema);
