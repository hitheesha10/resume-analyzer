import Resume from "../models/Resume.js";
import { parseResumePDF } from "../services/resumeParserService.js";
import { extractKeywords, extractPhrases } from "../services/keywordService.js";
import { calculateATSScore, getScoreGrade } from "../services/atsScoreService.js";

// @desc    Upload and parse resume
// @route   POST /resume/upload
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }
    
    const result = await parseResumePDF(req.file.buffer);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: {
        text: result.text,
        preview: result.text.substring(0, 500),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pageCount: result.pageCount,
        wordCount: result.wordCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Analyze resume against job description
// @route   POST /resume/analyze
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription, fileName } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Resume text and job description are required"
      });
    }
    
    // Extract keywords
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    const jdPhrases = extractPhrases(jobDescription);
    const resumePhrases = extractPhrases(resumeText);
    
    // Calculate ATS Score
    const atsResult = calculateATSScore(jdKeywords, resumeKeywords, jobDescription, resumeText);
    const scoreGrade = getScoreGrade(atsResult.score);
    
    // Generate suggestions
    const suggestions = generateSuggestions(atsResult, resumeText, jobDescription);
    
    const result = {
      success: true,
      data: {
        atsScore: atsResult.score,
        scoreGrade: scoreGrade.grade,
        scoreColor: scoreGrade.color,
        scoreMessage: scoreGrade.message,
        keywordAnalysis: {
          totalKeywords: atsResult.totalJDKeywords,
          matchingKeywords: atsResult.matchingKeywords,
          missingKeywords: atsResult.missingKeywords,
          matchedKeywords: atsResult.matchedKeywordsList,
          matchPercentage: atsResult.matchPercentage
        },
        suggestions: suggestions,
        metadata: {
          resumeWordCount: resumeText.split(/\s+/).length,
          jdWordCount: jobDescription.split(/\s+/).length,
          uniqueResumeKeywords: resumeKeywords.length,
          uniqueJDKeywords: jdKeywords.length
        }
      }
    };
    
    // Save to database if user is authenticated
    if (req.user) {
      const resumeDoc = new Resume({
        userId: req.user.id,
        fileName: fileName || "Uploaded Resume",
        fileSize: req.body.fileSize,
        originalText: resumeText.substring(0, 10000),
        jdText: jobDescription.substring(0, 5000),
        atsScore: atsResult.score,
        keywordAnalysis: {
          totalKeywords: atsResult.totalJDKeywords,
          matchingKeywords: atsResult.matchingKeywords,
          missingKeywords: atsResult.missingKeywords,
          matchedKeywordsList: atsResult.matchedKeywordsList
        },
        suggestions: suggestions,
        status: "completed"
      });
      await resumeDoc.save();
      result.data.id = resumeDoc._id;
    }
    
    res.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's resume history
// @route   GET /resume/history
export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("fileName atsScore scoreGrade status createdAt");
    
    res.json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single resume analysis by ID
// @route   GET /resume/:id
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: "Resume not found"
      });
    }
    
    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete resume analysis
// @route   DELETE /resume/:id
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: "Resume not found"
      });
    }
    
    res.json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to generate AI-like suggestions
function generateSuggestions(atsResult, resumeText, jobDescription) {
  const suggestions = {
    compatibility_score: atsResult.score,
    strengths: [],
    weaknesses: [],
    missing_keywords: atsResult.missingKeywords.slice(0, 10),
    optimization_tips: [],
    overall_assessment: ""
  };
  
  // Generate strengths
  if (atsResult.matchingKeywords.length > 5) {
    suggestions.strengths.push(`Strong keyword match with ${atsResult.matchingKeywords.length} relevant skills`);
  }
  if (resumeText.length > 1000) {
    suggestions.strengths.push("Comprehensive resume with good detail");
  }
  if (atsResult.matchPercentage > 60) {
    suggestions.strengths.push("Good alignment with job requirements");
  }
  
  // Generate weaknesses
  if (atsResult.missingKeywords.length > 10) {
    suggestions.weaknesses.push("Missing many key skills mentioned in the job description");
  }
  if (resumeText.length < 500) {
    suggestions.weaknesses.push("Resume is too brief. Add more details about your experience");
  }
  if (atsResult.matchPercentage < 50) {
    suggestions.weaknesses.push("Low keyword match. Resume needs significant optimization");
  }
  
  // Generate optimization tips
  if (atsResult.missingKeywords.length > 0) {
    suggestions.optimization_tips.push(`Add these keywords: ${atsResult.missingKeywords.slice(0, 5).join(", ")}`);
  }
  suggestions.optimization_tips.push("Use bullet points with action verbs (e.g., 'Developed', 'Led', 'Created')");
  suggestions.optimization_tips.push("Quantify your achievements with numbers and percentages");
  suggestions.optimization_tips.push("Include a skills section with relevant technologies");
  suggestions.optimization_tips.push("Tailor your resume summary for each job application");
  
  // Generate overall assessment
  if (atsResult.score >= 80) {
    suggestions.overall_assessment = "Excellent match! Your resume is well-optimized for this position. Focus on the missing keywords for perfection.";
  } else if (atsResult.score >= 60) {
    suggestions.overall_assessment = `Good match! Your resume matches ${atsResult.matchingKeywords} out of ${atsResult.totalJDKeywords} key skills. Add the missing keywords to improve your chances.`;
  } else if (atsResult.score >= 40) {
    suggestions.overall_assessment = `Average match. Consider significant revision to include more relevant keywords and restructure your resume for better ATS compatibility.`;
  } else {
    suggestions.overall_assessment = "Your resume needs substantial optimization. Review the job description carefully and incorporate more relevant keywords and skills.";
  }
  
  return suggestions;
}