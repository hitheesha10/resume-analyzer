import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.memoryStorage();

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isMimeValid = allowedMimes.includes(file.mimetype);
  const isExtensionValid = allowedExtensions.includes(fileExtension);
  
  if (isMimeValid && isExtensionValid) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1 // Only one file at a time
  }
});

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Only one file can be uploaded at a time'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field name. Please use "resume" as the field name'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next(err);
};