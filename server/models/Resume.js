import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fileName: {
    type: String,
    default: "Uploaded Resume"
  },
  originalText: {
    type: String
  },
  jdText: {
    type: String
  },
  atsScore: {
    type: Number,
    default: 0
  },
  keywordAnalysis: {
    type: Object,
    default: {}
  },
  suggestions: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// NO pre-save middleware - completely removed

export default mongoose.model("Resume", resumeSchema);