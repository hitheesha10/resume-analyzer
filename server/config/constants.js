/**
 * Application constants and configuration
 */

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  PREMIUM: 'premium'
};

export const RESUME_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const ATS_SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  AVERAGE: 40,
  POOR: 0
};

export const SCORE_GRADES = {
  EXCELLENT: { grade: 'A+', label: 'Excellent', color: '#10b981' },
  GOOD: { grade: 'A', label: 'Good', color: '#3b82f6' },
  AVERAGE: { grade: 'B', label: 'Average', color: '#f59e0b' },
  POOR: { grade: 'C', label: 'Needs Improvement', color: '#ef4444' }
};

export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIMES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf']
};

export const API_RESPONSE_MESSAGES = {
  // Success messages
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  UPLOAD_SUCCESS: 'Resume uploaded and parsed successfully',
  ANALYSIS_SUCCESS: 'Resume analysis completed',
  
  // Error messages
  REGISTER_ERROR: 'Registration failed',
  LOGIN_ERROR: 'Login failed',
  UPLOAD_ERROR: 'File upload failed',
  ANALYSIS_ERROR: 'Analysis failed',
  
  // Validation messages
  INVALID_EMAIL: 'Please provide a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  NAME_REQUIRED: 'Name is required',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  FILE_REQUIRED: 'Please upload a file',
  FILE_TOO_LARGE: 'File too large. Maximum size is 5MB',
  INVALID_FILE_TYPE: 'Only PDF files are allowed'
};