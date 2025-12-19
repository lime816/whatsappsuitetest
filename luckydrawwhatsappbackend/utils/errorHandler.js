/**
 * Error handling utilities for consistent error responses
 */

const logger = require('./logger');

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} details - Additional error details
 * @param {Object} extra - Extra data to include
 */
function sendErrorResponse(res, statusCode, message, details = null, extra = {}) {
  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...extra
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    errorResponse.details = details;
  }
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Handle async route errors
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express route handler with error catching
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorMiddleware(err, req, res, next) {
  logger.error('Unhandled error in route:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return sendErrorResponse(res, 400, 'Validation failed', err.message);
  }
  
  if (err.name === 'CastError') {
    return sendErrorResponse(res, 400, 'Invalid ID format', err.message);
  }
  
  if (err.code === 11000) {
    return sendErrorResponse(res, 409, 'Duplicate entry', 'Resource already exists');
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal server error' 
    : err.message || 'Something went wrong';
    
  sendErrorResponse(res, statusCode, message, err.message);
}

/**
 * Handle common route errors with consistent responses
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} operation - Operation that failed (e.g., 'creating trigger')
 */
function handleRouteError(res, error, operation) {
  logger.error(`Error ${operation}:`, error);
  
  // Check for specific error types
  if (error.message.includes('not found')) {
    return sendErrorResponse(res, 404, 'Resource not found', error.message);
  }
  
  if (error.message.includes('already exists')) {
    return sendErrorResponse(res, 409, 'Resource already exists', error.message);
  }
  
  if (error.message.includes('required')) {
    return sendErrorResponse(res, 400, 'Missing required data', error.message);
  }
  
  if (error.message.includes('invalid') || error.message.includes('Invalid')) {
    return sendErrorResponse(res, 400, 'Invalid data provided', error.message);
  }
  
  // Default server error
  sendErrorResponse(res, 500, `Failed to ${operation}`, error.message);
}

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function sendSuccessResponse(res, data, message = null, statusCode = 200) {
  const response = {
    success: true,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    response.message = message;
  }
  
  if (data !== undefined) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
}

module.exports = {
  sendErrorResponse,
  asyncHandler,
  errorMiddleware,
  handleRouteError,
  sendSuccessResponse
};