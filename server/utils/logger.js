import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Professional logging utility with different log levels
 * Supports console output and file logging in production
 */
class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';
    
    // Create logs directory in production
    if (process.env.NODE_ENV === 'production') {
      this.logDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      pid: process.pid
    });
  }

  logToFile(level, message, meta) {
    if (!this.logDir) return;
    
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);
    const logMessage = this.formatMessage(level, message, meta) + '\n';
    
    fs.appendFileSync(logFile, logMessage);
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('INFO', message, meta);
    console.log(formatted);
    this.logToFile('INFO', message, meta);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('ERROR', message, meta);
    console.error(formatted);
    this.logToFile('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('WARN', message, meta);
    console.warn(formatted);
    this.logToFile('WARN', message, meta);
  }

  debug(message, meta = {}) {
    if (this.currentLevel !== 'DEBUG') return;
    const formatted = this.formatMessage('DEBUG', message, meta);
    console.debug(formatted);
  }
}

export default new Logger();