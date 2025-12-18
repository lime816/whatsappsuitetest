/**
 * Test WhatsApp Routes
 * Simple endpoints to test WhatsApp functionality
 */

const express = require('express');
const router = express.Router();
const WinnerNotificationService = require('../services/winnerNotificationService');

const winnerService = new WinnerNotificationService();

/**
 * POST /api/test-whatsapp/send-test
 * Send a test message using hello_world template
 */
router.post('/send-test', async (req, res) => {
  try {
    const { phoneNumber, name, prize } = req.body;

    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Use default values if not provided
    const recipientName = name || 'Test User';
    const prizePosition = prize || '1st';

    console.log(`🧪 Testing WhatsApp message to: ${phoneNumber}`);
    console.log(`📱 Using hello_world template with: ${recipientName} - ${prizePosition} Prize Winner`);

    // Send test notification
    const result = await winnerService.sendWinnerNotification(
      phoneNumber,
      recipientName,
      prizePosition
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test WhatsApp message sent successfully',
        data: {
          messageId: result.messageId,
          phoneNumber: result.recipientPhone,
          content: `${recipientName} - ${prizePosition} Prize Winner`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test message',
        details: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error in test WhatsApp route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/test-whatsapp/config
 * Check WhatsApp configuration
 */
router.get('/config', (req, res) => {
  const hasAccessToken = !!process.env.WHATSAPP_ACCESS_TOKEN;
  const hasPhoneNumberId = !!process.env.WHATSAPP_PHONE_NUMBER_ID;

  res.json({
    success: true,
    config: {
      hasAccessToken,
      hasPhoneNumberId,
      phoneNumberId: hasPhoneNumberId ? 
        process.env.WHATSAPP_PHONE_NUMBER_ID.substring(0, 5) + '...' : 
        'Not set',
      accessToken: hasAccessToken ? 
        'Set (length: ' + process.env.WHATSAPP_ACCESS_TOKEN.length + ')' : 
        'Not set',
      isConfigured: hasAccessToken && hasPhoneNumberId
    }
  });
});

/**
 * POST /api/test-whatsapp/validate-phone
 * Validate phone number format
 */
router.post('/validate-phone', (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phoneNumber.replace(/\s+/g, ''));

    // Check if it starts with country code
    const hasCountryCode = phoneNumber.startsWith('+') || phoneNumber.length > 10;

    res.json({
      success: true,
      validation: {
        phoneNumber,
        isValid,
        hasCountryCode,
        formatted: phoneNumber.replace(/\s+/g, ''),
        suggestions: isValid ? [] : [
          'Phone number should include country code (e.g., +919876543210)',
          'Remove any spaces or special characters',
          'Ensure the number is between 7-15 digits'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error in phone validation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
