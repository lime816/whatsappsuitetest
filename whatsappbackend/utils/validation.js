/**
 * Validation utilities for consistent request validation
 */

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { isValid: boolean, missingFields: Array, error: string }
 */
function validateRequiredFields(body, requiredFields) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    error: missingFields.length > 0 
      ? `Missing required fields: ${missingFields.join(', ')}`
      : null
  };
}

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} - { isValid: boolean, formatted: string, error: string }
 */
function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      formatted: null,
      error: 'Phone number is required and must be a string'
    };
  }
  
  // Remove spaces and special characters
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Basic phone number validation (7-15 digits)
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      formatted: null,
      error: 'Invalid phone number format. Should be 7-15 digits with optional country code'
    };
  }
  
  // Ensure it starts with + for international format
  const formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  
  return {
    isValid: true,
    formatted,
    error: null
  };
}

/**
 * Validate WhatsApp Flow ID format
 * @param {string} flowId - Flow ID to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
function validateFlowId(flowId) {
  if (!flowId || typeof flowId !== 'string') {
    return {
      isValid: false,
      error: 'Flow ID is required and must be a string'
    };
  }
  
  // Flow IDs are typically numeric strings
  if (!/^\d+$/.test(flowId.trim())) {
    return {
      isValid: false,
      error: 'Flow ID must be a numeric string'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Validate trigger keyword
 * @param {string} keyword - Keyword to validate
 * @returns {Object} - { isValid: boolean, normalized: string, error: string }
 */
function validateKeyword(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    return {
      isValid: false,
      normalized: null,
      error: 'Keyword is required and must be a string'
    };
  }
  
  const normalized = keyword.toLowerCase().trim();
  
  if (normalized.length === 0) {
    return {
      isValid: false,
      normalized: null,
      error: 'Keyword cannot be empty'
    };
  }
  
  if (normalized.length > 50) {
    return {
      isValid: false,
      normalized: null,
      error: 'Keyword must be 50 characters or less'
    };
  }
  
  return {
    isValid: true,
    normalized,
    error: null
  };
}

/**
 * Express middleware for validating required fields
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} - Express middleware function
 */
function requireFields(requiredFields) {
  return (req, res, next) => {
    const validation = validateRequiredFields(req.body, requiredFields);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        missingFields: validation.missingFields
      });
    }
    
    next();
  };
}

module.exports = {
  validateRequiredFields,
  validatePhoneNumber,
  validateFlowId,
  validateKeyword,
  requireFields
};