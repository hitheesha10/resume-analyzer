import User from '../models/User.js';
import logger from '../utils/logger.js';
import { formatApiResponse } from '../utils/helpers.js';

/**
 * Authentication Controller
 * Handles user registration, login, and account management
 */
class AuthController {
  /**
   * Register a new user
   * @route POST /auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(
          formatApiResponse(false, null, 'Email already registered')
        );
      }

      // Create new user
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      });

      logger.info(`New user registered: ${email}`);

      res.status(201).json(
        formatApiResponse(true, {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }, 'User registered successfully')
      );

    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json(
          formatApiResponse(false, null, 'Invalid credentials')
        );
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json(
          formatApiResponse(false, null, 'Invalid credentials')
        );
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json(
          formatApiResponse(false, null, 'Account deactivated. Contact support.')
        );
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = user.generateAuthToken();

      logger.info(`User logged in: ${email}`);

      res.json(
        formatApiResponse(true, {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            analytics: user.analytics
          }
        }, 'Login successful')
      );

    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get current user profile
   * @route GET /auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      res.json(
        formatApiResponse(true, {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          analytics: user.analytics
        })
      );

    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get user statistics
   * @route GET /auth/stats
   */
  async getUserStats(req, res, next) {
    try {
      const Resume = (await import('../models/Resume.js')).default;
      const stats = await Resume.getUserStats(req.user.id);
      
      res.json(
        formatApiResponse(true, {
          ...stats,
          memberSince: req.user.createdAt,
          accountStatus: req.user.isActive ? 'active' : 'inactive'
        })
      );

    } catch (error) {
      logger.error(`Stats error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Change password
   * @route PUT /auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.user.id).select('+password');
      
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(401).json(
          formatApiResponse(false, null, 'Current password is incorrect')
        );
      }
      
      user.password = newPassword;
      await user.save();
      
      logger.info(`Password changed for user: ${user.email}`);
      
      res.json(
        formatApiResponse(true, null, 'Password updated successfully')
      );

    } catch (error) {
      logger.error(`Password change error: ${error.message}`);
      next(error);
    }
  }
}

export default new AuthController();