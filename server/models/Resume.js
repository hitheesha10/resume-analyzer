import mongoose from 'mongoose';

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
    default: 0
  },
  keywordAnalysis: {
    totalKeywords: { type: Number, default: 0 },
    matchingKeywords: { type: Number, default: 0 },
    matchPercentage: { type: Number, default: 0 },
    missingKeywords: { type: [String], default: [] },
    matchedKeywords: { type: [String], default: [] }
  },
  suggestions: {
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    optimizationTips: { type: [String], default: [] },
    overallAssessment: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  processingTime: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ atsScore: -1 });

export default mongoose.model('Resume', resumeSchema);