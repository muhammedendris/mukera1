const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
  },
  technicalSkills: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  communication: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  professionalism: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  problemSolving: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  overallPerformance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  comments: {
    type: String,
    required: [true, 'Comments are required'],
    minlength: [50, 'Comments must be at least 50 characters']
  },
  strengths: {
    type: String,
    trim: true
  },
  areasForImprovement: {
    type: String,
    trim: true
  },
  recommendation: {
    type: String,
    enum: ['Highly Recommended', 'Recommended', 'Recommended with Reservations', 'Not Recommended'],
    required: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one evaluation per application
evaluationSchema.index({ application: 1 }, { unique: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
