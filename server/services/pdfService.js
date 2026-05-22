import fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Professional PDF parsing service using pdf-parse
 */
class PDFService {
  /**
   * Parse PDF from buffer
   * @param {Buffer} fileBuffer - PDF file buffer
   * @returns {Promise<Object>} Parsed PDF data
   */
  async parseBuffer(fileBuffer) {
    try {
      const data = await pdf(fileBuffer);
      
      return {
        success: true,
        text: this.cleanText(data.text),
        metadata: {
          pageCount: data.numpages,
          info: data.info,
          version: data.version
        }
      };
    } catch (error) {
      console.error('PDF Parse Error:', error);
      return {
        success: false,
        error: 'Failed to parse PDF file. Please ensure it is a valid PDF.'
      };
    }
  }

  /**
   * Parse PDF from file path
   * @param {string} filePath - Path to PDF file
   */
  async parseFile(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return await this.parseBuffer(fileBuffer);
    } catch (error) {
      console.error('File read error:', error);
      return {
        success: false,
        error: 'Could not read file'
      };
    }
  }

  /**
   * Clean extracted text
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters (keep important ones)
      .replace(/[^\w\s.,!?\-@#$%&*()\/]/g, '')
      // Remove extra spaces around punctuation
      .replace(/\s+([.,!?])/g, '$1')
      // Trim whitespace
      .trim();
  }

  /**
   * Validate PDF buffer
   */
  validatePDF(buffer) {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Empty file buffer' };
    }
    
    // Check PDF signature (%PDF)
    const header = buffer.toString('ascii', 0, 5);
    if (!header.startsWith('%PDF')) {
      return { valid: false, error: 'Invalid PDF format' };
    }
    
    // Check file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return { valid: false, error: 'File too large. Maximum 5MB' };
    }
    
    return { valid: true };
  }

  /**
   * Extract text statistics
   */
  getTextStats(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const characters = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      characterCount: characters,
      sentenceCount: sentences.length,
      avgWordLength: words.length > 0 ? Math.round(characters / words.length) : 0,
      estimatedReadTime: Math.ceil(words.length / 200) // minutes
    };
  }
}

export default new PDFService();