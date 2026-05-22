import { SCORE_GRADES, ATS_SCORE_THRESHOLDS } from '../config/constants.js';

/**
 * Professional ATS scoring service
 */
class ATSService {
  /**
   * Calculate ATS compatibility score
   * @param {string[]} jdKeywords - Extracted keywords from job description
   * @param {string[]} resumeKeywords - Extracted keywords from resume
   * @returns {Object} Score analysis
   */
  calculateScore(jdKeywords, resumeKeywords) {
    if (!jdKeywords.length) {
      return this.getEmptyScore();
    }

    const uniqueJD = [...new Set(jdKeywords)];
    const resumeSet = new Set(resumeKeywords);
    
    const matchedKeywords = uniqueJD.filter(k => resumeSet.has(k));
    const missingKeywords = uniqueJD.filter(k => !resumeSet.has(k));
    
    const simpleScore = (matchedKeywords.length / uniqueJD.length) * 100;
    
    // Weighted scoring: give more weight to important keywords
    const weightedScore = this.calculateWeightedScore(uniqueJD, resumeSet);
    
    // Combine scores (70% weighted, 30% simple)
    const finalScore = Math.round((weightedScore * 0.7) + (simpleScore * 0.3));
    
    return {
      score: Math.min(finalScore, 100),
      totalKeywords: uniqueJD.length,
      matchingKeywords: matchedKeywords.length,
      matchPercentage: Math.round((matchedKeywords.length / uniqueJD.length) * 100),
      missingKeywords: missingKeywords.slice(0, 20),
      matchedKeywords: matchedKeywords.slice(0, 20),
      grade: this.getGrade(finalScore),
      color: this.getColor(finalScore)
    };
  }

  /**
   * Calculate weighted score based on keyword importance
   */
  calculateWeightedScore(keywords, resumeSet) {
    let totalWeight = 0;
    let achievedWeight = 0;
    
    for (const keyword of keywords) {
      const weight = this.getKeywordWeight(keyword);
      totalWeight += weight;
      if (resumeSet.has(keyword)) {
        achievedWeight += weight;
      }
    }
    
    return totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;
  }

  /**
   * Determine keyword importance weight
   */
  getKeywordWeight(keyword) {
    const highPriority = ['react', 'node', 'python', 'javascript', 'aws', 'docker'];
    const mediumPriority = ['mongodb', 'postgresql', 'git', 'api'];
    
    if (highPriority.includes(keyword.toLowerCase())) return 3;
    if (mediumPriority.includes(keyword.toLowerCase())) return 2;
    return 1;
  }

  /**
   * Get score grade
   */
  getGrade(score) {
    if (score >= ATS_SCORE_THRESHOLDS.EXCELLENT) return SCORE_GRADES.EXCELLENT;
    if (score >= ATS_SCORE_THRESHOLDS.GOOD) return SCORE_GRADES.GOOD;
    if (score >= ATS_SCORE_THRESHOLDS.AVERAGE) return SCORE_GRADES.AVERAGE;
    return SCORE_GRADES.POOR;
  }

  /**
   * Get color based on score
   */
  getColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  /**
   * Generate AI-like suggestions
   */
  generateSuggestions(score, missingKeywords, matchedKeywords) {
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
    if (score >= 60) {
      suggestions.strengths.push('Good overall match with job requirements');
    }
    suggestions.strengths.push('Resume has clear structure and formatting');

    // Generate weaknesses
    if (missingKeywords.length > 10) {
      suggestions.weaknesses.push('Missing many key skills mentioned in the job description');
    }
    if (score < 50) {
      suggestions.weaknesses.push('Low keyword match. Resume needs significant optimization');
    }
    suggestions.weaknesses.push('Consider adding more quantifiable achievements');

    // Generate optimization tips
    if (missingKeywords.length > 0) {
      suggestions.optimizationTips.push(`Add these keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
    }
    suggestions.optimizationTips.push('Use bullet points with action verbs (e.g., "Developed", "Led", "Created")');
    suggestions.optimizationTips.push('Quantify your achievements with numbers and percentages');
    suggestions.optimizationTips.push('Include a skills section with relevant technologies');
    suggestions.optimizationTips.push('Tailor your resume summary for each job application');

    // Generate overall assessment
    if (score >= 80) {
      suggestions.overallAssessment = 'Excellent match! Your resume is well-optimized for this position. Minor improvements suggested for perfection.';
    } else if (score >= 60) {
      suggestions.overallAssessment = `Good match! Your resume matches ${matchedKeywords.length} out of ${matchedKeywords.length + missingKeywords.length} key skills. Add the missing keywords to improve your chances.`;
    } else if (score >= 40) {
      suggestions.overallAssessment = 'Average match. Consider significant revision to include more relevant keywords and restructure your resume for better ATS compatibility.';
    } else {
      suggestions.overallAssessment = 'Your resume needs substantial optimization. Review the job description carefully and incorporate more relevant keywords and skills.';
    }

    return suggestions;
  }

  getEmptyScore() {
    return {
      score: 0,
      totalKeywords: 0,
      matchingKeywords: 0,
      matchPercentage: 0,
      missingKeywords: [],
      matchedKeywords: [],
      grade: SCORE_GRADES.POOR,
      color: '#ef4444'
    };
  }
}

export default new ATSService();