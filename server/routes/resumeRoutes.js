import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js';
import {
  uploadResume,
  analyzeResume,
  getResumeHistory,
  getResumeById,
  deleteResume
} from '../controllers/resumeController.js';

const router = express.Router();

// All resume routes require authentication
router.use(protect);

router.post('/upload', upload.single('resume'), handleUploadError, uploadResume);
router.post('/analyze', analyzeResume);
router.get('/history', getResumeHistory);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;