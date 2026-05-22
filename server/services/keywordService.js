/**
 * Professional keyword extraction service
 */
class KeywordService {
  constructor() {
    this.stopWords = new Set([
      'the', 'and', 'for', 'with', 'this', 'that', 'are', 'was', 'were',
      'have', 'has', 'had', 'but', 'not', 'you', 'your', 'from', 'they',
      'will', 'can', 'all', 'been', 'our', 'their', 'about', 'what',
      'which', 'when', 'where', 'who', 'how', 'could', 'would', 'should',
      'use', 'using', 'used', 'able', 'also', 'being', 'than', 'then',
      'there', 'their', 'theyre', 'would', 'should', 'could', 'does',
      'doing', 'did', 'into', 'through', 'during', 'without', 'within'
    ]);

    this.techKeywords = new Set([
      'react', 'node', 'python', 'javascript', 'typescript', 'java', 'c++',
      'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp', 'docker',
      'kubernetes', 'git', 'jenkins', 'ci/cd', 'rest', 'graphql', 'api'
    ]);
  }

  /**
   * Extract keywords from text
   * @param {string} text - Input text
   * @param {number} minLength - Minimum keyword length
   * @returns {string[]} Extracted keywords
   */
  extract(text, minLength = 3) {
    if (!text || typeof text !== 'string') return [];
    
    // Convert to lowercase and extract words
    const words = text.toLowerCase()
      .match(new RegExp(`\\b[a-z0-9${this.getSpecialChars()}]{${minLength},}\\b`, 'g')) || [];
    
    // Filter stop words and short words
    const filtered = words.filter(word => 
      !this.stopWords.has(word) && word.length >= minLength
    );
    
    // Remove duplicates and return
    return [...new Set(filtered)];
  }

  /**
   * Extract keywords with frequency
   */
  extractWithFrequency(text, minLength = 3) {
    const words = this.extract(text, minLength);
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));
  }

  /**
   * Extract technical keywords specifically
   */
  extractTechKeywords(text) {
    const allKeywords = this.extract(text, 3);
    return allKeywords.filter(keyword => this.techKeywords.has(keyword));
  }

  /**
   * Extract phrases (2-3 word combinations)
   */
  extractPhrases(text, maxPhrases = 20) {
    const sentences = text.split(/[.!?]+/);
    const phrases = [];
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const phrase = words.slice(0, 3).join(' ').toLowerCase();
        if (phrase.length > 5 && !this.stopWords.has(words[0])) {
          phrases.push(phrase);
        }
      }
    }
    
    return [...new Set(phrases)].slice(0, maxPhrases);
  }

  /**
   * Calculate keyword density
   */
  calculateDensity(text, keyword) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex) || [];
    const totalWords = text.split(/\s+/).length;
    return totalWords > 0 ? (matches.length / totalWords) * 100 : 0;
  }

  /**
   * Find missing keywords between job description and resume
   */
  findMissingKeywords(jdKeywords, resumeKeywords) {
    const jdSet = new Set(jdKeywords);
    const resumeSet = new Set(resumeKeywords);
    return [...jdSet].filter(keyword => !resumeSet.has(keyword));
  }

  /**
   * Find matching keywords
   */
  findMatchingKeywords(jdKeywords, resumeKeywords) {
    const jdSet = new Set(jdKeywords);
    const resumeSet = new Set(resumeKeywords);
    return [...jdSet].filter(keyword => resumeSet.has(keyword));
  }

  getSpecialChars() {
    return '';
  }
}

export default new KeywordService();