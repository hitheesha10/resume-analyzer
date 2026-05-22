import mongoose from 'mongoose';
import { RESUME_STATUS } from '../config/constants.js';

/**
 * Resume Schema - Stores analysis results
 */
const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number
  },
  originalText: {
    type: String,
    maxlength: 10000
  },
  jdText: {
    type: String,
    maxlength: 5000
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    index: true
  },
  scoreGrade: {
    type: String,
    enum: ['A+', 'A', 'B', 'C']
  },
  keywordAnalysis: {
    totalKeywords: Number,
    matchingKeywords: Number,
    matchingPercentage: Number,
    missingKeywords: [String],
    matchedKeywords: [String]
  },
  suggestions: {
    strengths: [String],
    weaknesses: [String],
    missingKeywords: [String],
    optimizationTips: [String],
    overallAssessment: String
  },
  status: {
    type: String,
    enum: Object.values(RESUME_STATUS),
    default: RESUME_STATUS.PENDING
  },
  processingTime: {
    type: Number,
    default: 0
  },
  metadata: {
    wordCount: Number,
    pageCount: Number,
    readabilityScore: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ atsScore: -1 });

// Calculate score grade before saving
resumeSchema.pre('save', function(next) {
  if (this.atsScore >= 80) this.scoreGrade = 'A+';
  else if (this.atsScore >= 60) this.scoreGrade = 'A';
  else if (this.atsScore >= 40) this.scoreGrade = 'B';
  else this.scoreGrade = 'C';
  next();
});

// Static method to get user statistics
resumeSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId.createFromHexString(userId) } },
    { $group: {
      _id: null,
      totalAnalyzed: { $sum: 1 },
      averageScore: { $avg: '$atsScore' },
      highestScore: { $max: '$atsScore' },
      lowestScore: { $min: '$atsScore' }
    }}
  ]);
  return stats[0] || { totalAnalyzed: 0, averageScore: 0, highestScore: 0, lowestScore: 0 };
};

export default mongoose.model('Resume', resumeSchema);