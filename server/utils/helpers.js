/**
 * Utility helper functions
 */

export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s.,!?-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const truncateText = (text, maxLength = 500) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const calculateReadTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const extractDomainFromEmail = (email) => {
  return email.split('@')[1];
};

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const getPagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

export const formatApiResponse = (success, data = null, message = null, errors = null) => {
  const response = { success };
  if (data) response.data = data;
  if (message) response.message = message;
  if (errors) response.errors = errors;
  return response;
};