import Resume from '../models/Resume.js';
import pdf from 'pdf-parse';

// ============ HELPER FUNCTIONS ============

// Parse PDF from buffer
async function parsePDF(fileBuffer) {
  try {
    const data = await pdf(fileBuffer);
    return data.text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('PDF Parse Error:', error);
    throw new Error('Failed to parse PDF. Please ensure it is a valid PDF file.');
  }
}

// Extract keywords from text
function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  
  const words = text.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) || [];
  
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'are', 'was', 'were',
    'have', 'has', 'had', 'but', 'not', 'you', 'your', 'from', 'they',
    'will', 'can', 'all', 'been', 'our', 'their', 'about', 'what',
    'which', 'when', 'where', 'who', 'how', 'could', 'would', 'should',
    'use', 'using', 'used', 'able', 'also', 'being', 'than', 'then'
  ]);
  
  return [...new Set(words.filter(word => !stopWords.has(word)))];
}

// Calculate ATS compatibility score
function calculateATSScore(jdKeywords, resumeKeywords) {
  if (!jdKeywords.length) {
    return {
      score: 0,
      totalKeywords: 0,
      matchingKeywords: 0,
      matchPercentage: 0,
      missingKeywords: [],
      matchedKeywords: []
    };
  }
  
  const uniqueJD = [...new Set(jdKeywords)];
  const resumeSet = new Set(resumeKeywords);
  
  const matchedKeywords = uniqueJD.filter(keyword => resumeSet.has(keyword));
  const missingKeywords = uniqueJD.filter(keyword => !resumeSet.has(keyword));
  const matchPercentage = Math.round((matchedKeywords.length / uniqueJD.length) * 100);
  
  // Weighted scoring
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const keyword of uniqueJD) {
    const weight = getKeywordWeight(keyword);
    totalWeight += weight;
    if (resumeSet.has(keyword)) {
      weightedScore += weight;
    }
  }
  
  const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : matchPercentage;
  
  return {
    score: finalScore,
    totalKeywords: uniqueJD.length,
    matchingKeywords: matchedKeywords.length,
    matchPercentage: matchPercentage,
    missingKeywords: missingKeywords.slice(0, 20),
    matchedKeywords: matchedKeywords.slice(0, 20)
  };
}

// Get keyword importance weight
function getKeywordWeight(keyword) {
  const highPriority = ['react', 'node', 'python', 'javascript', 'typescript', 'java', 'aws', 'docker', 'kubernetes', 'sql'];
  const mediumPriority = ['mongodb', 'postgresql', 'mysql', 'git', 'api', 'rest', 'graphql', 'express'];
  
  if (highPriority.includes(keyword.toLowerCase())) return 3;
  if (mediumPriority.includes(keyword.toLowerCase())) return 2;
  return 1;
}

// Generate AI-like suggestions
function generateSuggestions(atsResult) {
  const { score, missingKeywords, matchedKeywords, totalKeywords } = atsResult;
  
  const suggestions = {
    strengths: [],
    weaknesses: [],
    missingKeywords: missingKeywords.slice(0, 15),
    optimizationTips: [],
    overallAssessment: ''
  };
  
  // Generate strengths
  if (matchedKeywords.length > 5) {
    suggestions.strengths.push(`Strong keyword alignment with ${matchedKeywords.length} relevant skills`);
  }
  if (score >= 70) {
    suggestions.strengths.push('Excellent overall match with job requirements');
  } else if (score >= 50) {
    suggestions.strengths.push('Good foundation with room for improvement');
  }
  suggestions.strengths.push('Clear resume structure and formatting');
  
  // Generate weaknesses
  if (missingKeywords.length > 10) {
    suggestions.weaknesses.push(`Missing ${missingKeywords.length} key skills from the job description`);
  }
  if (score < 50) {
    suggestions.weaknesses.push('Low keyword match - resume needs significant optimization');
  }
  suggestions.weaknesses.push('Consider adding more quantifiable achievements');
  
  // Generate optimization tips
  if (missingKeywords.length > 0) {
    suggestions.optimizationTips.push(`Add these keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  suggestions.optimizationTips.push('Use bullet points with action verbs (e.g., "Developed", "Led", "Created")');
  suggestions.optimizationTips.push('Quantify your achievements with numbers and percentages');
  suggestions.optimizationTips.push('Include a dedicated skills section with relevant technologies');
  suggestions.optimizationTips.push('Tailor your resume summary for each job application');
  suggestions.optimizationTips.push('Use standard section headings (Experience, Education, Skills)');
  
  // Generate overall assessment
  if (score >= 80) {
    suggestions.overallAssessment = 'Excellent match! Your resume is well-optimized for this position. Minor improvements suggested for perfection.';
  } else if (score >= 60) {
    suggestions.overallAssessment = `Good match! Your resume matches ${matchedKeywords.length} out of ${totalKeywords} key skills. Add the missing keywords to significantly improve your chances.`;
  } else if (score >= 40) {
    suggestions.overallAssessment = 'Average match. Consider significant revision to include more relevant keywords and restructure your resume for better ATS compatibility.';
  } else {
    suggestions.overallAssessment = 'Your resume needs substantial optimization. Review the job description carefully and incorporate more relevant keywords and skills.';
  }
  
  return suggestions;
}

// ============ CONTROLLER METHODS (EXPORTED) ============

// @desc    Upload and parse resume PDF
// @route   POST /resume/upload
export const uploadResume = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file'
      });
    }
    
    const text = await parsePDF(req.file.buffer);
    
    if (!text || text.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract meaningful text from the PDF. Please ensure it contains readable text.'
      });
    }
    
    res.json({
      success: true,
      data: {
        text: text,
        preview: text.substring(0, 500),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        wordCount: text.split(/\s+/).length
      }
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Analyze resume against job description
// @route   POST /resume/analyze
export const analyzeResume = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { resumeText, jobDescription, fileName } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and job description are required'
      });
    }
    
    // Extract keywords
    const jdKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);
    
    // Calculate ATS score
    const atsResult = calculateATSScore(jdKeywords, resumeKeywords);
    
    // Generate suggestions
    const suggestions = generateSuggestions(atsResult);
    
    // Prepare response
    const result = {
      success: true,
      data: {
        atsScore: atsResult.score,
        keywordAnalysis: {
          totalKeywords: atsResult.totalKeywords,
          matchingKeywords: atsResult.matchingKeywords,
          matchPercentage: atsResult.matchPercentage,
          missingKeywords: atsResult.missingKeywords,
          matchedKeywords: atsResult.matchedKeywords
        },
        suggestions: suggestions,
        metadata: {
          processingTime: Date.now() - startTime,
          resumeWordCount: resumeText.split(/\s+/).length,
          jdWordCount: jobDescription.split(/\s+/).length
        }
      }
    };
    
    // Save to database if user is authenticated
    if (req.user) {
      const resume = new Resume({
        userId: req.user.id,
        fileName: fileName || 'Uploaded Resume',
        originalText: resumeText.substring(0, 5000),
        jdText: jobDescription.substring(0, 3000),
        atsScore: atsResult.score,
        keywordAnalysis: {
          totalKeywords: atsResult.totalKeywords,
          matchingKeywords: atsResult.matchingKeywords,
          matchPercentage: atsResult.matchPercentage,
          missingKeywords: atsResult.missingKeywords,
          matchedKeywords: atsResult.matchedKeywords
        },
        suggestions: suggestions,
        processingTime: Date.now() - startTime
      });
      
      await resume.save();
      result.data.id = resume._id;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's resume analysis history
// @route   GET /resume/history
export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('fileName atsScore keywordAnalysis suggestions.optimizationTips createdAt');
    
    res.json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single resume by ID
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
        error: 'Resume analysis not found'
      });
    }
    
    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error.message);
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
        error: 'Resume analysis not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Resume analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};