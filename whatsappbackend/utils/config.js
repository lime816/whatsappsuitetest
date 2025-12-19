/**
 * Configuration utilities for CORS and environment settings
 */

/**
 * Get CORS configuration based on environment
 * @returns {Object} CORS options object
 */
function getCorsConfig() {
  const corsOptions = {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:5175',
      // Allow all localhost ports for development
      /^http:\/\/localhost:\d+$/,
      // Allow Railway/Vercel/Netlify deployments
      /^https:\/\/.*\.railway\.app$/,
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.onrender\.com$/,
      // Allow all origins in development (remove in production)
      process.env.NODE_ENV === 'development' ? '*' : null
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  return corsOptions;
}

/**
 * Get environment configuration
 * @returns {Object} Environment configuration object
 */
function getEnvironmentConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3002;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    isProduction,
    port,
    frontendUrl,
    environment: process.env.NODE_ENV || 'development'
  };
}

module.exports = {
  getCorsConfig,
  getEnvironmentConfig
};
