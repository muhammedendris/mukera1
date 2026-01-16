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
  // Dynamic skills assessment array
  skillsAssessment: [{
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score must be at least 0'],
      max: [100, 'Score cannot exceed 100']
    }
  }],
  // Auto-calculated total score
  totalScore: {
    type: Number,
    default: 0
  },
  // Auto-calculated average score
  averageScore: {
    type: Number,
    default: 0
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

// Pre-save middleware to calculate totalScore and averageScore
evaluationSchema.pre('save', function(next) {
  if (this.skillsAssessment && this.skillsAssessment.length > 0) {
    // Calculate total score
    this.totalScore = this.skillsAssessment.reduce((sum, skill) => sum + skill.score, 0);

    // Calculate average score
    this.averageScore = Math.round(this.totalScore / this.skillsAssessment.length);
  } else {
    this.totalScore = 0;
    this.averageScore = 0;
  }
  next();
});

// Ensure one evaluation per application
evaluationSchema.index({ application: 1 }, { unique: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
