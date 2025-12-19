/**
 * WhatsApp API credentials validation utility
 */

/**
 * Validate WhatsApp API credentials
 * @returns {Object} - { isValid: boolean, missing: Array, error: string }
 */
function validateWhatsAppCredentials() {
  const required = {
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
  };
  
  const missing = [];
  
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    error: missing.length > 0 
      ? `Missing WhatsApp credentials: ${missing.join(', ')}`
      : null
  };
}

/**
 * Get WhatsApp API configuration
 * @returns {Object} - Configuration object with credentials status
 */
function getWhatsAppConfig() {
  return {
    hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
    hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    hasBusinessAccountId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v22.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 
      process.env.WHATSAPP_PHONE_NUMBER_ID.substring(0, 4) + '***' : null
  };
}

/**
 * Express middleware to ensure WhatsApp credentials are configured
 */
function requireWhatsAppCredentials(req, res, next) {
  const validation = validateWhatsAppCredentials();
  
  if (!validation.isValid) {
    return res.status(500).json({
      success: false,
      error: 'WhatsApp API not configured',
      details: validation.error,
      missing: validation.missing
    });
  }
  
  next();
}

module.exports = {
  validateWhatsAppCredentials,
  getWhatsAppConfig,
  requireWhatsAppCredentials
};