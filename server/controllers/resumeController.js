import Resume from '../models/Resume.js';
import PDFService from '../services/pdfService.js';
import KeywordService from '../services/keywordService.js';
import ATSService from '../services/atsService.js';
import GeminiService from '../services/geminiService.js';
import logger from '../utils/logger.js';
import { formatApiResponse, truncateText } from '../utils/helpers.js';
import { RESUME_STATUS, SCORE_GRADES } from '../config/constants.js';

/**
 * Resume Controller
 * Handles resume upload, analysis, and history with AI integration
 */
class ResumeController {
  /**
   * Upload and parse resume PDF
   * @route POST /resume/upload
   */
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json(
          formatApiResponse(false, null, 'Please upload a PDF file')
        );
      }

      // Validate PDF
      const validation = PDFService.validatePDF(req.file.buffer);
      if (!validation.valid) {
        return res.status(400).json(
          formatApiResponse(false, null, validation.error)
        );
      }

      // Parse PDF
      const result = await PDFService.parseBuffer(req.file.buffer);
      
      if (!result.success) {
        return res.status(400).json(
          formatApiResponse(false, null, result.error)
        );
      }

      // Get text statistics
      const stats = PDFService.getTextStats(result.text);

      logger.info(`Resume uploaded: ${req.file.originalname} by user ${req.user.id}`);

      res.json(
        formatApiResponse(true, {
          text: result.text,
          preview: result.text.substring(0, 500),
          fileName: req.file.originalname,
          fileSize: req.file.size,
          metadata: {
            pageCount: result.metadata.pageCount,
            ...stats
          }
        }, 'Resume uploaded and parsed successfully')
      );

    } catch (error) {
      logger.error(`Upload error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Analyze resume against job description with AI enhancement
   * @route POST /resume/analyze
   */
  async analyze(req, res, next) {
    const startTime = Date.now();
    
    try {
      const { resumeText, jobDescription, fileName } = req.body;

      // Validate input
      if (!resumeText || !jobDescription) {
        return res.status(400).json(
          formatApiResponse(false, null, 'Resume text and job description are required')
        );
      }

      // ========== 1. EXTRACT KEYWORDS ==========
      const jdKeywords = KeywordService.extract(jobDescription);
      const resumeKeywords = KeywordService.extract(resumeText);
      
      // Get technical keywords for enhanced analysis
      const jdTechKeywords = KeywordService.extractTechKeywords(jobDescription);
      const resumeTechKeywords = KeywordService.extractTechKeywords(resumeText);
      
      // Extract phrases for better context
      const jdPhrases = KeywordService.extractPhrases(jobDescription);
      const resumePhrases = KeywordService.extractPhrases(resumeText);

      // ========== 2. CALCULATE ATS SCORE ==========
      const atsResult = ATSService.calculateScore(jdKeywords, resumeKeywords);
      
      // ========== 3. GET AI-POWERED ANALYSIS FROM GEMINI ==========
      let aiAnalysis = null;
      let usedAIFallback = false;
      let aiError = null;
      
      if (GeminiService.isAvailable()) {
        try {
          logger.info('Requesting Gemini AI analysis...');
          aiAnalysis = await GeminiService.analyzeResume(resumeText, jobDescription);
          logger.info('Gemini AI analysis completed successfully');
        } catch (error) {
          aiError = error.message;
          usedAIFallback = true;
          logger.error(`Gemini analysis failed: ${error.message}`);
        }
      } else {
        usedAIFallback = true;
        logger.warn('Gemini AI not available, using fallback analysis');
      }

      // ========== 4. GENERATE SUGGESTIONS (AI or Fallback) ==========
      let suggestions;
      
      if (aiAnalysis && !usedAIFallback) {
        // Use AI-generated suggestions
        suggestions = {
          // AI-generated content
          executive_summary: aiAnalysis.executive_summary || null,
          strengths: aiAnalysis.strengths || [],
          weaknesses: aiAnalysis.weaknesses || [],
          missing_keywords: aiAnalysis.missing_keywords || atsResult.missingKeywords,
          keyword_suggestions: aiAnalysis.keyword_suggestions || {
            skills_to_add: [],
            tools_to_add: [],
            certifications_to_add: []
          },
          optimization_tips: aiAnalysis.optimization_tips || [],
          bullet_point_improvements: aiAnalysis.bullet_point_improvements || [],
          formatting_advice: aiAnalysis.formatting_advice || null,
          overall_assessment: aiAnalysis.overall_assessment || null,
          
          // Enhanced ATS data
          compatibility_score: aiAnalysis.compatibility_score || atsResult.score,
          ats_score: atsResult.score,
          
          // Metadata
          ai_enhanced: true,
          ai_model: 'gemini-2.0-flash-exp'
        };
      } else {
        // Use fallback suggestions
        const fallbackSuggestions = ATSService.generateSuggestions(
          atsResult.score,
          atsResult.missingKeywords,
          atsResult.matchedKeywords
        );
        
        suggestions = {
          executive_summary: `Your resume matches ${atsResult.matchingKeywords} out of ${atsResult.totalKeywords} key skills from the job description.`,
          strengths: fallbackSuggestions.strengths || [],
          weaknesses: fallbackSuggestions.weaknesses || [],
          missing_keywords: atsResult.missingKeywords,
          keyword_suggestions: {
            skills_to_add: atsResult.missingKeywords.filter(k => !jdTechKeywords.includes(k)).slice(0, 5),
            tools_to_add: jdTechKeywords.filter(k => !resumeTechKeywords.includes(k)).slice(0, 5),
            certifications_to_add: []
          },
          optimization_tips: fallbackSuggestions.optimizationTips || [],
          bullet_point_improvements: fallbackSuggestions.bullet_point_improvements || [],
          formatting_advice: "Use standard section headings (Experience, Education, Skills) for better ATS parsing. Avoid tables and complex formatting.",
          overall_assessment: fallbackSuggestions.overallAssessment || "",
          compatibility_score: atsResult.score,
          ats_score: atsResult.score,
          ai_enhanced: false,
          ai_error: aiError
        };
      }

      // ========== 5. PREPARE RESPONSE DATA ==========
      const resumeStats = PDFService.getTextStats(resumeText);
      const jdStats = PDFService.getTextStats(jobDescription);

      // Calculate score grade
      const getScoreGrade = (score) => {
        if (score >= 80) return { grade: 'A+', label: 'Excellent', color: '#10b981' };
        if (score >= 60) return { grade: 'A', label: 'Good', color: '#3b82f6' };
        if (score >= 40) return { grade: 'B', label: 'Average', color: '#f59e0b' };
        return { grade: 'C', label: 'Needs Improvement', color: '#ef4444' };
      };

      const scoreGrade = getScoreGrade(atsResult.score);

      const result = {
        // Score information
        atsScore: atsResult.score,
        scoreGrade: scoreGrade.grade,
        scoreLabel: scoreGrade.label,
        scoreColor: scoreGrade.color,
        
        // Keyword analysis
        keywordAnalysis: {
          totalKeywords: atsResult.totalKeywords,
          matchingKeywords: atsResult.matchingKeywords,
          matchPercentage: atsResult.matchPercentage,
          missingKeywords: atsResult.missingKeywords,
          matchedKeywords: atsResult.matchedKeywords,
          techKeywords: {
            found: resumeTechKeywords,
            missing: jdTechKeywords.filter(k => !resumeTechKeywords.includes(k)),
            all_jd_tech: jdTechKeywords
          },
          phrases: {
            jd_phrases: jdPhrases.slice(0, 10),
            resume_phrases: resumePhrases.slice(0, 10)
          }
        },
        
        // AI-powered suggestions
        suggestions: suggestions,
        
        // Resume and JD metadata
        metadata: {
          resume: {
            wordCount: resumeStats.wordCount,
            characterCount: resumeStats.characterCount,
            sentenceCount: resumeStats.sentenceCount,
            estimatedReadTime: resumeStats.estimatedReadTime
          },
          jobDescription: {
            wordCount: jdStats.wordCount,
            characterCount: jdStats.characterCount,
            sentenceCount: jdStats.sentenceCount,
            estimatedReadTime: jdStats.estimatedReadTime
          },
          processingTime: Date.now() - startTime,
          aiEnhanced: !usedAIFallback
        },
        
        // Timestamp
        analyzedAt: new Date().toISOString()
      };

      // ========== 6. SAVE TO DATABASE ==========
      const resume = new Resume({
        userId: req.user.id,
        fileName: fileName || 'Uploaded Resume',
        originalText: truncateText(resumeText, 5000),
        jdText: truncateText(jobDescription, 3000),
        atsScore: atsResult.score,
        scoreGrade: scoreGrade.grade,
        keywordAnalysis: {
          totalKeywords: atsResult.totalKeywords,
          matchingKeywords: atsResult.matchingKeywords,
          matchingPercentage: atsResult.matchPercentage,
          missingKeywords: atsResult.missingKeywords,
          matchedKeywords: atsResult.matchedKeywords
        },
        suggestions: {
          strengths: suggestions.strengths,
          weaknesses: suggestions.weaknesses,
          missingKeywords: suggestions.missing_keywords,
          optimizationTips: suggestions.optimization_tips,
          overallAssessment: suggestions.overall_assessment
        },
        metadata: {
          wordCount: resumeStats.wordCount,
          pageCount: 1,
          readabilityScore: null,
          aiEnhanced: !usedAIFallback
        },
        processingTime: Date.now() - startTime,
        status: RESUME_STATUS.COMPLETED
      });

      await resume.save();

      // ========== 7. UPDATE USER ANALYTICS ==========
      await req.user.updateAnalytics(atsResult.score);

      // ========== 8. LOG AND RESPOND ==========
      logger.info(`Resume analyzed for user ${req.user.id}: Score ${atsResult.score}, AI Enhanced: ${!usedAIFallback}, Processing Time: ${Date.now() - startTime}ms`);

      res.json(
        formatApiResponse(true, result, 'Analysis completed successfully')
      );

    } catch (error) {
      logger.error(`Analysis error: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
      next(error);
    }
  }

  /**
   * Get user's resume analysis history with pagination
   * @route GET /resume/history
   */
  async getHistory(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const [resumes, total] = await Promise.all([
        Resume.find({ userId: req.user.id })
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(limitNum)
          .select('fileName atsScore scoreGrade createdAt metadata.processingTime'),
        Resume.countDocuments({ userId: req.user.id })
      ]);

      // Calculate statistics
      const stats = await Resume.getUserStats(req.user.id);

      res.json(
        formatApiResponse(true, {
          resumes,
          statistics: {
            totalAnalyzed: stats.totalAnalyzed || 0,
            averageScore: Math.round(stats.averageScore || 0),
            highestScore: stats.highestScore || 0,
            lowestScore: stats.lowestScore || 0
          },
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1
          }
        })
      );

    } catch (error) {
      logger.error(`History error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get single resume analysis by ID
   * @route GET /resume/:id
   */
  async getResumeById(req, res, next) {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!resume) {
        return res.status(404).json(
          formatApiResponse(false, null, 'Resume analysis not found')
        );
      }

      res.json(
        formatApiResponse(true, resume)
      );

    } catch (error) {
      logger.error(`Get resume error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Delete resume analysis
   * @route DELETE /resume/:id
   */
  async deleteResume(req, res, next) {
    try {
      const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!resume) {
        return res.status(404).json(
          formatApiResponse(false, null, 'Resume analysis not found')
        );
      }

      logger.info(`Resume deleted: ${resume._id} by user ${req.user.id}`);

      res.json(
        formatApiResponse(true, null, 'Resume analysis deleted successfully')
      );

    } catch (error) {
      logger.error(`Delete error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get resume analysis statistics for dashboard
   * @route GET /resume/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await Resume.getUserStats(req.user.id);
      
      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentActivity = await Resume.find({
        userId: req.user.id,
        createdAt: { $gte: thirtyDaysAgo }
      }).select('atsScore createdAt').sort({ createdAt: 1 });

      // Calculate score trends
      const scoreTrend = recentActivity.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        score: item.atsScore
      }));

      res.json(
        formatApiResponse(true, {
          overall: {
            totalAnalyzed: stats.totalAnalyzed || 0,
            averageScore: Math.round(stats.averageScore || 0),
            highestScore: stats.highestScore || 0,
            lowestScore: stats.lowestScore || 0
          },
          recentActivity: {
            count: recentActivity.length,
            last30DaysAverage: recentActivity.length > 0 
              ? Math.round(recentActivity.reduce((sum, r) => sum + r.atsScore, 0) / recentActivity.length)
              : 0
          },
          scoreTrend: scoreTrend,
          memberSince: req.user.createdAt
        })
      );

    } catch (error) {
      logger.error(`Stats error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Re-analyze an existing resume with updated job description
   * @route POST /resume/:id/reanalyze
   */
  async reanalyze(req, res, next) {
    try {
      const { jobDescription } = req.body;
      
      if (!jobDescription) {
        return res.status(400).json(
          formatApiResponse(false, null, 'Job description is required for re-analysis')
        );
      }

      const existingResume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!existingResume) {
        return res.status(404).json(
          formatApiResponse(false, null, 'Resume analysis not found')
        );
      }

      // Create new analysis request
      const newReq = {
        body: {
          resumeText: existingResume.originalText,
          jobDescription: jobDescription,
          fileName: existingResume.fileName
        },
        user: req.user
      };

      const newRes = {
        json: (data) => data,
        status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
      };

      // Call analyze method
      const result = await this.analyze(newReq, newRes, next);
      
      res.json(
        formatApiResponse(true, result, 'Re-analysis completed successfully')
      );

    } catch (error) {
      logger.error(`Re-analysis error: ${error.message}`);
      next(error);
    }
  }
}

export default new ResumeController();