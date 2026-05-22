import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

/**
 * Professional Gemini AI Service
 * Handles AI-powered resume analysis and suggestions
 */
class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    this.initialize();
  }

  /**
   * Initialize Gemini AI client
   */
  initialize() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        logger.warn('GEMINI_API_KEY not found. AI features will be disabled.');
        this.isInitialized = false;
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000,
          topP: 0.95,
          topK: 40
        }
      });
      this.isInitialized = true;
      logger.info('✅ Gemini AI service initialized');
    } catch (error) {
      logger.error(`Gemini initialization failed: ${error.message}`);
      this.isInitialized = false;
    }
  }

  /**
   * Generate AI-powered resume analysis
   * @param {string} resumeText - Extracted resume text
   * @param {string} jobDescription - Job description text
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeResume(resumeText, jobDescription) {
    if (!this.isInitialized) {
      return this.getFallbackAnalysis();
    }

    try {
      const prompt = this.buildAnalysisPrompt(resumeText, jobDescription);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const analysis = this.parseAIResponse(text);
      
      logger.info('Gemini analysis completed successfully');
      return analysis;
      
    } catch (error) {
      logger.error(`Gemini analysis error: ${error.message}`);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Build comprehensive prompt for Gemini
   */
  buildAnalysisPrompt(resumeText, jobDescription) {
    // Truncate texts to avoid token limits
    const truncatedResume = resumeText.substring(0, 6000);
    const truncatedJD = jobDescription.substring(0, 3000);
    
    return `You are an expert ATS (Applicant Tracking System) resume analyzer with 10+ years of experience in HR tech. 
Your task is to analyze a resume against a job description and provide detailed, actionable feedback.

## Job Description:
${truncatedJD}

## Resume:
${truncatedResume}

## Instructions:
Provide a professional, detailed analysis in the following JSON format. Be specific, actionable, and honest.

{
  "compatibility_score": <number 0-100>,
  "executive_summary": "<1-2 sentence overview>",
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "weaknesses": [
    "<specific area to improve 1>",
    "<specific area to improve 2>",
    "<specific area to improve 3>"
  ],
  "missing_keywords": [
    "<important keyword from JD not found>",
    "<another missing keyword>"
  ],
  "keyword_suggestions": {
    "skills_to_add": ["<skill>", "<skill>"],
    "tools_to_add": ["<tool>", "<tool>"],
    "certifications_to_add": ["<cert>", "<cert>"]
  },
  "optimization_tips": [
    "<specific actionable tip 1>",
    "<specific actionable tip 2>",
    "<specific actionable tip 3>",
    "<specific actionable tip 4>"
  ],
  "bullet_point_improvements": [
    {
      "original": "<example weak bullet point from resume>",
      "improved": "<improved version with metrics>",
      "reason": "<why this improvement helps>"
    }
  ],
  "formatting_advice": "<specific formatting recommendations>",
  "overall_assessment": "<detailed paragraph with final recommendations>"
}

## Important Rules:
1. Be specific and reference actual content from the resume and JD
2. Provide actionable advice, not generic statements
3. Missing keywords should be directly from the job description
4. Suggest quantifiable improvements (numbers, metrics)
5. Be constructive and encouraging
6. Return ONLY valid JSON, no markdown formatting`;
  }

  /**
   * Parse AI response and extract JSON
   */
  parseAIResponse(responseText) {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanedText);
      
      // Validate required fields
      return this.validateAnalysis(parsed);
      
    } catch (error) {
      logger.error(`JSON parsing error: ${error.message}`);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Validate and ensure all required fields exist
   */
  validateAnalysis(analysis) {
    const defaultAnalysis = this.getFallbackAnalysis();
    
    return {
      compatibility_score: analysis.compatibility_score || defaultAnalysis.compatibility_score,
      executive_summary: analysis.executive_summary || defaultAnalysis.executive_summary,
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : defaultAnalysis.strengths,
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : defaultAnalysis.weaknesses,
      missing_keywords: Array.isArray(analysis.missing_keywords) ? analysis.missing_keywords : defaultAnalysis.missing_keywords,
      keyword_suggestions: analysis.keyword_suggestions || defaultAnalysis.keyword_suggestions,
      optimization_tips: Array.isArray(analysis.optimization_tips) ? analysis.optimization_tips : defaultAnalysis.optimization_tips,
      bullet_point_improvements: Array.isArray(analysis.bullet_point_improvements) ? analysis.bullet_point_improvements : defaultAnalysis.bullet_point_improvements,
      formatting_advice: analysis.formatting_advice || defaultAnalysis.formatting_advice,
      overall_assessment: analysis.overall_assessment || defaultAnalysis.overall_assessment
    };
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  getFallbackAnalysis() {
    return {
      compatibility_score: 65,
      executive_summary: "Your resume shows good potential but needs optimization for better ATS compatibility.",
      strengths: [
        "Clear professional experience section",
        "Good use of technical terminology",
        "Relevant skills mentioned"
      ],
      weaknesses: [
        "Missing quantifiable achievements",
        "Could use more industry-specific keywords",
        "Consider adding a professional summary"
      ],
      missing_keywords: [],
      keyword_suggestions: {
        skills_to_add: ["Consider adding more specific technical skills"],
        tools_to_add: ["Include relevant tools and technologies"],
        certifications_to_add: ["Add relevant certifications if applicable"]
      },
      optimization_tips: [
        "Add a skills section with relevant technologies",
        "Quantify your achievements with numbers and metrics",
        "Use bullet points with strong action verbs",
        "Tailor your resume summary to each job application",
        "Include specific project outcomes and results"
      ],
      bullet_point_improvements: [
        {
          original: "Responsible for developing features",
          improved: "Developed 5+ major features that increased user engagement by 30%",
          reason: "Adds quantifiable impact and specific metrics"
        }
      ],
      formatting_advice: "Use standard section headings (Experience, Education, Skills) for better ATS parsing. Avoid tables and complex formatting.",
      overall_assessment: "Your resume has a solid foundation. Focus on adding more quantifiable achievements and incorporating keywords from the job description to improve your ATS score significantly."
    };
  }

  /**
   * Generate resume improvement suggestions
   * @param {string} resumeText - Original resume text
   * @param {string} section - Specific section to improve
   */
  async improveSection(resumeText, section = 'experience') {
    if (!this.isInitialized) {
      return { success: false, message: 'AI service unavailable' };
    }

    try {
      const prompt = `Improve the ${section} section of this resume. Make it more impactful, quantifiable, and ATS-friendly. Return only the improved text without explanations.\n\nResume:\n${resumeText.substring(0, 3000)}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        improvedText: response.text()
      };
      
    } catch (error) {
      logger.error(`Section improvement error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate custom cover letter based on resume and JD
   */
  async generateCoverLetter(resumeText, jobDescription) {
    if (!this.isInitialized) {
      return { success: false, message: 'AI service unavailable' };
    }

    try {
      const prompt = `Write a professional cover letter based on this resume and job description. Keep it concise (300-400 words), highlight relevant experience, and show enthusiasm for the role.\n\nResume:\n${resumeText.substring(0, 3000)}\n\nJob Description:\n${jobDescription.substring(0, 2000)}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        coverLetter: response.text()
      };
      
    } catch (error) {
      logger.error(`Cover letter generation error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return this.isInitialized;
  }
}

// Export singleton instance
export default new GeminiService();