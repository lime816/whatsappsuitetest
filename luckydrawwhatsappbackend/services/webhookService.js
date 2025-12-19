const { sendTextMessage, sendFlowMessage } = require('./whatsappService');
const { findMatchingTrigger } = require('./triggerService');
const logger = require('../utils/logger');
const { sessionCache } = require('../utils/cache');
const messageQueue = require('../utils/messageQueue');

/**
 * Process incoming webhook payload from WhatsApp Business API
 */
async function processWebhookPayload(payload) {
  if (payload.object !== 'whatsapp_business_account') {
    logger.debug('Not a WhatsApp Business webhook, ignoring');
    return;
  }

  const startTime = Date.now();
  let messagesProcessed = 0;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      // Only process relevant events
      if (change.field !== 'messages') {
        continue;
      }

      // Handle incoming messages
      if (change.value.messages) {
        for (const message of change.value.messages) {
          messagesProcessed++;
          
          // Process different message types
          if (message.type === 'interactive') {
            setImmediate(() => handleInteractiveMessage(message));
          } else {
            setImmediate(() => handleIncomingMessage(message));
          }
        }
      }

      // Handle message status updates (delivery, read, etc.)
      if (change.value.statuses) {
        for (const status of change.value.statuses) {
          setImmediate(() => handleMessageStatus(status));
        }
      }
    }
  }

  // Log performance metrics
  const processingTime = Date.now() - startTime;
  logger.performance(`Webhook processed: ${messagesProcessed} messages in ${processingTime}ms`);
}

/**
 * Handle individual incoming messages
 */
async function handleIncomingMessage(message) {
  const startTime = Date.now();
  
  try {
    logger.debug(`Processing message from ${message.from}`, {
      type: message.type,
      messageId: message.id
    });

    // Extract message text
    let messageText = '';
    if (message.type === 'text' && message.text) {
      messageText = message.text.body.trim();
    }

    // Skip if no text content
    if (!messageText) {
      logger.debug('No text content, skipping trigger matching');
      return;
    }

    // Check for existing conversation session
    const sessionKey = `session:${message.from}`;
    let session = sessionCache.get(sessionKey);

    // Try to find matching trigger
    const matchingTrigger = findMatchingTrigger(messageText);
    
    if (matchingTrigger) {
      logger.trigger(`Found matching trigger: "${matchingTrigger.keyword}"`, {
        flowId: matchingTrigger.flowId,
        phoneNumber: message.from
      });
      
      // Queue flow message instead of sending immediately
      messageQueue.add({
        type: 'flow',
        phoneNumber: message.from,
        flowId: matchingTrigger.flowId,
        text: matchingTrigger.message
      }, 'high'); // High priority for user interactions

      // Update session
      sessionCache.set(sessionKey, {
        lastTrigger: matchingTrigger.keyword,
        lastActivity: Date.now(),
        messageCount: (session?.messageCount || 0) + 1
      }, 72000); // 20 hours

      return;
    }

    // If no trigger matched, queue default help message
    logger.debug('No matching trigger found, queuing default help message');
    messageQueue.add({
      type: 'text',
      phoneNumber: message.from,
      text: getDefaultHelpMessage()
    }, 'normal');

  } catch (error) {
    logger.error('Error handling incoming message:', {
      error: error.message,
      phoneNumber: message.from,
      messageId: message.id
    });
    
    // Queue error message
    messageQueue.add({
      type: 'text',
      phoneNumber: message.from,
      text: 'Sorry, something went wrong. Please try again later.'
    }, 'high');
  } finally {
    const processingTime = Date.now() - startTime;
    logger.performance(`Message processed in ${processingTime}ms`, {
      phoneNumber: message.from
    });
  }
}

/**
 * Handle interactive messages (flow responses, button clicks)
 */
async function handleInteractiveMessage(message) {
  try {
    logger.debug(`Processing interactive message from ${message.from}`, {
      type: message.interactive?.type
    });

    // Handle flow completion responses
    if (message.interactive && message.interactive.nfm_reply) {
      await handleFlowCompletion(message);
      return;
    }

    // Handle button clicks
    if (message.interactive && message.interactive.button_reply) {
      await handleButtonClick(message);
      return;
    }

    // Handle list selections
    if (message.interactive && message.interactive.list_reply) {
      await handleListSelection(message);
      return;
    }

  } catch (error) {
    logger.error('Error handling interactive message:', {
      error: error.message,
      phoneNumber: message.from
    });
  }
}

/**
 * Handle WhatsApp Flow completion
 */
async function handleFlowCompletion(message) {
  try {
    const phoneNumber = message.from;
    const flowResponse = JSON.parse(message.interactive.nfm_reply.response_json);
    
    logger.info(`Flow completed by ${phoneNumber}`, {
      formFields: Object.keys(flowResponse).length
    });
    
    // Queue confirmation message
    messageQueue.add({
      type: 'text',
      phoneNumber: phoneNumber,
      text: 'Thank you! Your form has been submitted successfully. We will get back to you soon.'
    }, 'high');

    // Process form data asynchronously
    setImmediate(() => processFormData(phoneNumber, flowResponse));

  } catch (error) {
    logger.error('Error handling flow completion:', {
      error: error.message,
      phoneNumber: message.from
    });
  }
}

/**
 * Handle button clicks
 */
async function handleButtonClick(message) {
  const buttonId = message.interactive.button_reply.id;
  const phoneNumber = message.from;
  
  logger.debug(`Button clicked: ${buttonId}`, { phoneNumber });
  
  // Queue response message
  messageQueue.add({
    type: 'text',
    phoneNumber: phoneNumber,
    text: `You clicked: ${buttonId}. Thank you for your response!`
  }, 'high');
}

/**
 * Handle list selections
 */
async function handleListSelection(message) {
  const listItemId = message.interactive.list_reply.id;
  const listItemTitle = message.interactive.list_reply.title;
  const phoneNumber = message.from;
  
  logger.debug(`List item selected: ${listItemId}`, { 
    title: listItemTitle,
    phoneNumber 
  });
  
  // Queue response message
  messageQueue.add({
    type: 'text',
    phoneNumber: phoneNumber,
    text: `You selected: ${listItemTitle}. Thank you for your choice!`
  }, 'high');
}

/**
 * Process form data from flow completion
 */
async function processFormData(phoneNumber, formData) {
  try {
    logger.info(`Processing form data for ${phoneNumber}`, {
      fieldCount: Object.keys(formData).length
    });
    
    // Add your custom form processing logic here
    // Examples:
    // - Save to database
    // - Send email notifications
    // - Trigger other workflows
    // - Update CRM systems
    
    // Store in session cache for potential follow-up
    const sessionKey = `form:${phoneNumber}:${Date.now()}`;
    sessionCache.set(sessionKey, formData, 72000); // Store for 20 hours
    
    logger.info('Form data processed successfully', { phoneNumber });
    
  } catch (error) {
    logger.error('Error processing form data:', {
      error: error.message,
      phoneNumber
    });
  }
}

/**
 * Get default help message when no triggers match
 */
function getDefaultHelpMessage() {
  return `👋 Welcome! I'm here to help you.

🤖 *Available Commands:*
• Type keywords to trigger automated responses
• Use interactive buttons and menus when available

💡 *Need Help?*
Contact our support team for assistance.

Thank you for reaching out!`;
}

/**
 * Handle message status updates
 */
function handleMessageStatus(status) {
  // Only log important status updates in production
  if (status.status === 'failed' || status.status === 'undelivered') {
    logger.warn(`Message status: ${status.status}`, {
      messageId: status.id,
      recipient: status.recipient_id
    });
  } else {
    logger.verbose(`Message status: ${status.status}`, {
      messageId: status.id
    });
  }
}

/**
 * Simulate webhook for testing (text message)
 */
async function simulateWebhook(messageText, phoneNumber) {
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'test-entry',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: process.env.WHATSAPP_BUSINESS_NUMBER,
                phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
              },
              messages: [
                {
                  from: phoneNumber,
                  id: `test-msg-${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: {
                    body: messageText
                  }
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  logger.debug('Simulating webhook with text message:', { messageText });
  await processWebhookPayload(mockPayload);
  
  return {
    success: true,
    message: 'Webhook simulation completed',
    payload: mockPayload
  };
}

/**
 * Simulate interactive webhook for testing (button/list)
 */
async function simulateInteractiveWebhook(interactiveData, phoneNumber) {
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'test-entry',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: process.env.WHATSAPP_BUSINESS_NUMBER,
                phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
              },
              messages: [
                {
                  from: phoneNumber,
                  id: `test-msg-${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'interactive',
                  interactive: interactiveData
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  logger.debug('Simulating interactive webhook:', { interactiveData });
  await processWebhookPayload(mockPayload);
  
  return {
    success: true,
    message: 'Interactive webhook simulation completed',
    payload: mockPayload
  };
}

module.exports = {
  processWebhookPayload,
  simulateWebhook,
  simulateInteractiveWebhook
};
