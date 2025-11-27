const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  weekNumber: {
    type: Number,
    required: [true, 'Week number is required'],
    min: 1
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  filePath: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  advisorFeedback: {
    type: String,
    trim: true
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique week number per application
reportSchema.index({ application: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
