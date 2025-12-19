const express = require('express');
const { sendFlowMessage, sendTextMessage, testWhatsAppConnection } = require('../services/whatsappService');
const { asyncHandler, handleRouteError, sendSuccessResponse } = require('../utils/errorHandler');
const { requireFields } = require('../utils/validation');
const { getWhatsAppConfig, requireWhatsAppCredentials } = require('../utils/whatsappValidator');

const router = express.Router();

// Test WhatsApp connection
router.get('/test', asyncHandler(async (req, res) => {
  try {
    const result = await testWhatsAppConnection();
    sendSuccessResponse(res, result, 'WhatsApp connection test successful');
  } catch (error) {
    handleRouteError(res, error, 'testing WhatsApp connection');
  }
}));

// Send flow message manually
router.post('/send-flow', 
  requireWhatsAppCredentials,
  requireFields(['phoneNumber', 'flowId']), 
  asyncHandler(async (req, res) => {
    try {
      const { phoneNumber, flowId, message } = req.body;
      const result = await sendFlowMessage(phoneNumber, flowId, message);
      sendSuccessResponse(res, result, 'Flow sent successfully');
    } catch (error) {
      handleRouteError(res, error, 'sending flow message');
    }
  })
);

// Send plain text message (uses service role on backend)
router.post('/send-text', 
  requireWhatsAppCredentials,
  requireFields(['phoneNumber', 'text']), 
  asyncHandler(async (req, res) => {
    try {
      const { phoneNumber, text } = req.body;
      const result = await sendTextMessage(phoneNumber, text);
      sendSuccessResponse(res, result, 'Text message sent successfully');
    } catch (error) {
      handleRouteError(res, error, 'sending text message');
    }
  })
);

// Get WhatsApp configuration status
router.get('/config', (req, res) => {
  const config = getWhatsAppConfig();
  const isConfigured = config.hasAccessToken && config.hasPhoneNumberId && config.hasBusinessAccountId;
  
  sendSuccessResponse(res, { ...config, isConfigured });
});

// Register new flow and auto-create trigger
router.post('/register-flow', 
  requireFields(['flowId', 'activationMessage']), 
  asyncHandler(async (req, res) => {
    try {
      const { flowId, flowName, activationMessage, autoCreateTrigger = true } = req.body;

      // If auto-create trigger is enabled, create a webhook trigger
      if (autoCreateTrigger) {
        const { createTrigger } = require('../services/triggerService');
        
        try {
          const trigger = createTrigger({
            keyword: activationMessage.toLowerCase().trim(),
            flowId: flowId,
            message: `Hello! Please complete this ${flowName || 'form'}:`,
            isActive: true
          });

          console.log(`✅ Auto-created trigger for flow ${flowId}: "${activationMessage}" -> ${flowName || flowId}`);
          
          sendSuccessResponse(res, {
            flowId,
            flowName,
            activationMessage,
            trigger
          }, `Flow registered successfully! Trigger created for keyword "${activationMessage}"`);
        } catch (triggerError) {
          console.error('Error creating auto-trigger:', triggerError);
          
          // Flow registration succeeded, but trigger creation failed
          sendSuccessResponse(res, {
            flowId,
            flowName,
            activationMessage,
            trigger: null,
            warning: triggerError.message
          }, 'Flow registered successfully, but trigger creation failed');
        }
      } else {
        sendSuccessResponse(res, {
          flowId,
          flowName,
          activationMessage,
          trigger: null
        }, 'Flow registered successfully (no trigger created)');
      }
    } catch (error) {
      handleRouteError(res, error, 'registering flow');
    }
  })
);

module.exports = router;