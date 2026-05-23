import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Database from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ============ SECURITY MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// ============ CORS CONFIGURATION ============
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://*.netlify.app',
  'https://*.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern && pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ============ LOGGING MIDDLEWARE ============
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// ============ BODY PARSING MIDDLEWARE ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ RATE LIMITING ============
app.use('/api', generalLimiter);

// ============ HEALTH CHECK ENDPOINT ============
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// ============ API INFO ENDPOINT ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'ResumeScore API',
    version: '2.0.0',
    description: 'AI-Powered Resume ATS Analyzer',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        me: 'GET /auth/me',
        stats: 'GET /auth/stats'
      },
      resume: {
        upload: 'POST /resume/upload',
        analyze: 'POST /resume/analyze',
        history: 'GET /resume/history',
        stats: 'GET /resume/stats',
        getById: 'GET /resume/:id',
        delete: 'DELETE /resume/:id'
      },
      health: 'GET /health'
    },
    documentation: 'https://github.com/yourusername/resume-analyzer'
  });
});

// ============ API ROUTES ============
app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);

// ============ ERROR HANDLING MIDDLEWARE ============
app.use(notFound);
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await Database.connect();
    
    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📝 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// ============ GRACEFUL SHUTDOWN ============
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  try {
    await Database.disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

export default app;