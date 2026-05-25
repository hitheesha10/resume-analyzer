import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.memoryStorage();

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  console.log('File received:', file.originalname, 'MIME type:', file.mimetype)
  
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
})

// Error handler for multer
export const handleUploadError = (err, req, res, next) => {
  console.log('Multer error:', err)
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Only one file can be uploaded at a time.'
      })
    }
    return res.status(400).json({
      success: false,
      error: err.message
    })
  }
  
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only PDF files are allowed. Please upload a valid PDF.'
    })
  }
  
  next(err)
}