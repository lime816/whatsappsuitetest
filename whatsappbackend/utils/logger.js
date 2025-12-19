const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4
};

const LOG_LEVEL_NAMES = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE'];

class Logger {
  constructor() {
    this.currentLevel = this.getLogLevel();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getLogLevel() {
    const envLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG');
    return LOG_LEVELS[envLevel.toUpperCase()] || LOG_LEVELS.INFO;
  }

  shouldLog(level) {
    return level <= this.currentLevel;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    
    if (data && typeof data === 'object') {
      // In production, sanitize sensitive data
      if (this.isProduction) {
        data = this.sanitizeData(data);
      }
      return `[${timestamp}] ${levelName}: ${message} ${JSON.stringify(data)}`;
    }
    
    return `[${timestamp}] ${levelName}: ${message}`;
  }

  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['token', 'password', 'phone', 'email', 'access_token'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }
    
    return sanitized;
  }

  error(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage(LOG_LEVELS.ERROR, message, data));
    }
  }

  warn(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage(LOG_LEVELS.WARN, message, data));
    }
  }

  info(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(this.formatMessage(LOG_LEVELS.INFO, message, data));
    }
  }

  debug(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, data));
    }
  }

  verbose(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.VERBOSE)) {
      console.log(this.formatMessage(LOG_LEVELS.VERBOSE, message, data));
    }
  }

  // Special methods for common patterns
  webhook(message, data = null) {
    this.debug(`📨 WEBHOOK: ${message}`, data);
  }

  trigger(message, data = null) {
    this.debug(`🎯 TRIGGER: ${message}`, data);
  }

  whatsapp(message, data = null) {
    this.info(`📱 WHATSAPP: ${message}`, data);
  }

  performance(message, data = null) {
    this.debug(`⚡ PERF: ${message}`, data);
  }
}

module.exports = new Logger();