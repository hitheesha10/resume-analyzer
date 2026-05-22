import express from 'express';
import ResumeController from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js';
import { validateAnalysis } from '../middleware/validationMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All resume routes require authentication
router.use(protect);

// Upload and analyze routes with rate limiting
router.post('/upload', uploadLimiter, upload.single('resume'), handleUploadError, ResumeController.upload);
router.post('/analyze', uploadLimiter, validateAnalysis, ResumeController.analyze);

// History and management routes
router.get('/history', ResumeController.getHistory);
router.get('/:id', ResumeController.getResumeById);
router.delete('/:id', ResumeController.deleteResume);

export default router;