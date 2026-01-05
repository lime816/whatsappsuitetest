const logger = require('./logger');

/**
 * Enhanced error handler for flow operations
 */
class FlowErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.lastErrors = new Map();
  }

  /**
   * Handle API errors with context
   */
  handleApiError(error, context = {}) {
    const errorInfo = this.extractErrorInfo(error);
    const errorKey = `${context.operation || 'unknown'}_${errorInfo.code}`;
    
    // Track error frequency
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    this.lastErrors.set(errorKey, {
      timestamp: new Date(),
      error: errorInfo,
      context
    });

    // Log error with context
    logger.error('Flow operation error:', {
      operation: context.operation,
      error: errorInfo,
      context,
      count: this.errorCounts.get(errorKey)
    });

    // Return structured error response
    return {
      success: false,
      error: errorInfo.message,
      code: errorInfo.code,
      type: errorInfo.type,
      context: context,
      retryable: this.isRetryableError(errorInfo),
      suggestions: this.getErrorSuggestions(errorInfo, context)
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(validationResult, context = {}) {
    const errorInfo = {
      type: 'validation',
      message: 'Validation failed',
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      context
    };

    logger.warn('Validation error:', errorInfo);

    return {
      success: false,
      error: 'Validation failed',
      type: 'validation',
      details: {
        errors: validationResult.errors,
        warnings: validationResult.warnings
      },
      suggestions: this.getValidationSuggestions(validationResult)
    };
  }

  /**
   * Handle success responses
   */
  handleSuccess(message, data = null, context = {}) {
    logger.info('Flow operation success:', {
      message,
      context,
      timestamp: new Date()
    });

    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle warnings
   */
  handleWarning(message, context = {}) {
    logger.warn('Flow operation warning:', {
      message,
      context,
      timestamp: new Date()
    });

    return {
      success: true,
      warning: message,
      context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract structured error information
   */
  extractErrorInfo(error) {
    if (error.response?.data?.error) {
      // WhatsApp API error
      const apiError = error.response.data.error;
      return {
        type: 'api',
        code: apiError.code || error.response.status,
        message: apiError.message || 'API request failed',
        subcode: apiError.error_subcode,
        userTitle: apiError.error_user_title,
        userMessage: apiError.error_user_msg,
        traceId: apiError.fbtrace_id
      };
    }

    if (error.code === 'ECONNREFUSED') {
      return {
        type: 'connection',
        code: 'CONNECTION_REFUSED',
        message: 'Unable to connect to WhatsApp API'
      };
    }

    if (error.code === 'ENOTFOUND') {
      return {
        type: 'network',
        code: 'DNS_ERROR',
        message: 'Network connectivity issue'
      };
    }

    if (error.name === 'ValidationError') {
      return {
        type: 'validation',
        code: 'VALIDATION_FAILED',
        message: error.message
      };
    }

    // Generic error
    return {
      type: 'generic',
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred'
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(errorInfo) {
    const retryableCodes = [
      500, 502, 503, 504, // Server errors
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'RATE_LIMIT_EXCEEDED'
    ];

    return retryableCodes.includes(errorInfo.code) || 
           retryableCodes.includes(parseInt(errorInfo.code));
  }

  /**
   * Get error-specific suggestions
   */
  getErrorSuggestions(errorInfo, context) {
    const suggestions = [];

    switch (errorInfo.type) {
      case 'api':
        if (errorInfo.code === 401) {
          suggestions.push('Check your WhatsApp access token');
          suggestions.push('Verify token permissions and expiration');
        } else if (errorInfo.code === 403) {
          suggestions.push('Check if your WhatsApp Business Account has the required permissions');
          suggestions.push('Verify the flow is approved for your account');
        } else if (errorInfo.code === 404) {
          suggestions.push('Verify the flow ID exists');
          suggestions.push('Check if the flow was deleted or archived');
        } else if (errorInfo.code === 429) {
          suggestions.push('Rate limit exceeded - wait before retrying');
          suggestions.push('Consider implementing exponential backoff');
        }
        break;

      case 'connection':
        suggestions.push('Check your internet connection');
        suggestions.push('Verify WhatsApp API endpoints are accessible');
        suggestions.push('Check firewall and proxy settings');
        break;

      case 'validation':
        suggestions.push('Review the validation errors above');
        suggestions.push('Check component configuration and limits');
        suggestions.push('Ensure all required fields are provided');
        break;

      default:
        suggestions.push('Check the error details above');
        suggestions.push('Retry the operation if it appears to be temporary');
    }

    // Context-specific suggestions
    if (context.operation === 'createFlow') {
      suggestions.push('Ensure flow name is unique');
      suggestions.push('Check flow JSON structure and validation');
    } else if (context.operation === 'sendFlow') {
      suggestions.push('Verify the phone number format');
      suggestions.push('Ensure the flow is published and approved');
    }

    return suggestions;
  }

  /**
   * Get validation-specific suggestions
   */
  getValidationSuggestions(validationResult) {
    const suggestions = [];

    if (validationResult.errors.some(e => e.message.includes('exceeds'))) {
      suggestions.push('Reduce text length or number of components');
      suggestions.push('Split content across multiple screens');
    }

    if (validationResult.errors.some(e => e.message.includes('missing'))) {
      suggestions.push('Add required fields and properties');
      suggestions.push('Check component configuration');
    }

    if (validationResult.errors.some(e => e.message.includes('duplicate'))) {
      suggestions.push('Use unique names for form fields');
      suggestions.push('Remove duplicate components');
    }

    return suggestions;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: 0,
      errorsByType: {},
      errorsByOperation: {},
      recentErrors: []
    };

    for (const [key, count] of this.errorCounts.entries()) {
      stats.totalErrors += count;
      
      const lastError = this.lastErrors.get(key);
      if (lastError) {
        const operation = lastError.context.operation || 'unknown';
        const type = lastError.error.type || 'unknown';
        
        stats.errorsByOperation[operation] = (stats.errorsByOperation[operation] || 0) + count;
        stats.errorsByType[type] = (stats.errorsByType[type] || 0) + count;
        
        // Add to recent errors if within last hour
        if (Date.now() - lastError.timestamp.getTime() < 3600000) {
          stats.recentErrors.push({
            key,
            count,
            lastOccurred: lastError.timestamp,
            error: lastError.error,
            context: lastError.context
          });
        }
      }
    }

    // Sort recent errors by count
    stats.recentErrors.sort((a, b) => b.count - a.count);

    return stats;
  }

  /**
   * Clear error statistics
   */
  clearStats() {
    this.errorCounts.clear();
    this.lastErrors.clear();
    logger.info('Error statistics cleared');
  }

  /**
   * Create error handler instance with context
   */
  createContextHandler(defaultContext = {}) {
    return {
      handleApiError: (error, context = {}) => 
        this.handleApiError(error, { ...defaultContext, ...context }),
      
      handleValidationError: (validationResult, context = {}) => 
        this.handleValidationError(validationResult, { ...defaultContext, ...context }),
      
      handleSuccess: (message, data = null, context = {}) => 
        this.handleSuccess(message, data, { ...defaultContext, ...context }),
      
      handleWarning: (message, context = {}) => 
        this.handleWarning(message, { ...defaultContext, ...context })
    };
  }
}

// Create singleton instance
const flowErrorHandler = new FlowErrorHandler();

/**
 * Create error handler for specific operation
 */
function createErrorHandler(operation, additionalContext = {}) {
  return flowErrorHandler.createContextHandler({
    operation,
    ...additionalContext
  });
}

/**
 * Express middleware for handling flow operation errors
 */
function flowErrorMiddleware(err, req, res, next) {
  const context = {
    operation: req.route?.path || req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };

  const errorResponse = flowErrorHandler.handleApiError(err, context);
  
  // Determine status code
  let statusCode = 500;
  if (errorResponse.code === 'VALIDATION_FAILED') statusCode = 400;
  else if (errorResponse.code === 401) statusCode = 401;
  else if (errorResponse.code === 403) statusCode = 403;
  else if (errorResponse.code === 404) statusCode = 404;
  else if (errorResponse.code === 429) statusCode = 429;

  res.status(statusCode).json(errorResponse);
}

module.exports = {
  FlowErrorHandler,
  flowErrorHandler,
  createErrorHandler,
  flowErrorMiddleware
};