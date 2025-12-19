const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./utils/logger');
const databaseService = require('./services/databaseService');
const { triggerCache, sessionCache, rateLimitCache } = require('./utils/cache');
const { apiRateLimiter } = require('./utils/rateLimiter');
const { errorMiddleware } = require('./utils/errorHandler');

const webhookRoutes = require('./routes/webhook');
const triggerRoutes = require('./routes/triggers');
const whatsappRoutes = require('./routes/whatsapp');
const messageLibraryRoutes = require('./routes/messageLibrary');

const app = express();

// Security middleware
app.use(helmet());

// Import configuration utilities
const { getCorsConfig, getEnvironmentConfig } = require('./utils/config');

// Use dynamic CORS configuration
const corsOptions = getCorsConfig();
app.use(cors(corsOptions));

// Logging middleware - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware for API routes
app.use('/api', (req, res, next) => {
  if (!apiRateLimiter.isAllowed(req.ip)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60
    });
  }
  next();
});

// Health check endpoint with performance metrics
app.get('/health', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const dbHealth = await databaseService.healthCheck();
  
  res.json({
    status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
    },
    database: dbHealth,
    cache: {
      triggers: triggerCache.getStats(),
      sessions: sessionCache.getStats(),
      rateLimits: rateLimitCache.getStats()
    }
  });
});

// CORS Proxy endpoint for WhatsApp flow downloads
app.get('/api/proxy/flow-json', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing url parameter'
      });
    }

    logger.debug('Proxying flow JSON request:', { url });

    // Fetch the JSON from WhatsApp's download URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      logger.error('Failed to fetch from download URL:', { 
        status: response.status,
        url 
      });
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch: ${response.statusText}`
      });
    }

    const jsonData = await response.json();
    logger.info('Flow JSON fetched successfully via proxy');

    res.json({
      success: true,
      data: jsonData
    });
  } catch (error) {
    logger.error('Proxy error:', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to proxy request'
    });
  }
});

// Performance monitoring endpoint
app.get('/metrics', (req, res) => {
  const messageQueue = require('./utils/messageQueue');
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      triggers: triggerCache.getStats(),
      sessions: sessionCache.getStats(),
      rateLimits: rateLimitCache.getStats()
    },
    messageQueue: messageQueue.getStats(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/webhook', webhookRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/message-library', messageLibraryRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Webhook Server is running!',
    version: require('./package.json').version,
    endpoints: {
      webhook: '/webhook',
      triggers: '/api/triggers',
      whatsapp: '/api/whatsapp',
      messageLibrary: '/api/message-library',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, async () => {
  // Initialize database connection
  try {
    await databaseService.connect();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    logger.warn('Server will continue without database (using fallback storage)');
  }

  logger.info(`WhatsApp Automation Server started`, {
    host: HOST,
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version,
    webhookUrl: `http://${HOST}:${PORT}/webhook`,
    frontendCors: process.env.FRONTEND_URL || 'http://localhost:5173'
  });
  
  // Start cleanup interval
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    logger.performance('Memory usage check', {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
    });
  }, 300000); // Every 5 minutes
});

module.exports = app;