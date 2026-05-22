import express from 'express';
import AuthController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);

// Protected routes
router.get('/me', protect, AuthController.getMe);
router.get('/stats', protect, AuthController.getUserStats);
router.put('/change-password', protect, AuthController.changePassword);

export default router;