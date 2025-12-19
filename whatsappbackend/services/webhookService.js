const { sendTextMessage, sendFlowMessage } = require('./whatsappService');
const { findMatchingTrigger } = require('./triggerService');
const databaseService = require('./databaseService');
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

  // Log webhook event for debugging
  try {
    await databaseService.createWebhookEvent({
      eventType: 'incoming_webhook',
      payload: payload,
      processed: false
    });
  } catch (error) {
    logger.warn('Could not log webhook event:', error.message);
  }

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

    // Get or create contact
    let contact = await databaseService.getContactByPhone(message.from);
    if (!contact) {
      contact = await databaseService.createContact({
        phoneNumber: message.from,
        isActive: true
      });
    }

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

    // Update or create session
    let session = await databaseService.getActiveSession(contact.id);
    if (session) {
      await databaseService.updateSession(contact.id, {
        messageCount: session.messageCount + 1
      });
    } else {
      await databaseService.createSession({
        contactId: contact.id,
        messageCount: 1
      });
    }

    // Try to find matching trigger
    const matchingTrigger = await findMatchingTrigger(messageText);
    
    if (matchingTrigger) {
      logger.info(`Found matching trigger: "${matchingTrigger.triggerId}"`, {
        flowId: matchingTrigger.flowId,
        phoneNumber: message.from
      });
      
      // Update session with trigger info
      await databaseService.updateSession(contact.id, {
        lastTrigger: matchingTrigger.triggerId
      });

      // Queue appropriate response based on trigger action
      if (matchingTrigger.nextAction === 'send_flow' && matchingTrigger.flowId) {
        messageQueue.add({
          type: 'flow',
          phoneNumber: message.from,
          flowId: matchingTrigger.flowId,
          text: matchingTrigger.message || 'Please complete this form:'
        }, 'high');
      } else if (matchingTrigger.nextAction === 'send_message' && matchingTrigger.targetId) {
        // Get message template and send it
        const messageLibraryService = require('./messageLibraryService');
        const targetMessage = await messageLibraryService.getMessageById(matchingTrigger.targetId);
        
        if (targetMessage) {
          messageQueue.add({
            type: 'library_message',
            phoneNumber: message.from,
            messageTemplate: targetMessage
          }, 'high');
        }
      }

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

    // Get or create contact
    let contact = await databaseService.getContactByPhone(message.from);
    if (!contact) {
      contact = await databaseService.createContact({
        phoneNumber: message.from,
        isActive: true
      });
    }

    // Handle flow completion responses
    if (message.interactive && message.interactive.nfm_reply) {
      await handleFlowCompletion(message, contact);
      return;
    }

    // Handle button clicks and list selections
    if (message.interactive && (message.interactive.button_reply || message.interactive.list_reply)) {
      await handleInteractiveResponse(message, contact);
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
async function handleFlowCompletion(message, contact) {
  try {
    const phoneNumber = message.from;
    const flowResponse = JSON.parse(message.interactive.nfm_reply.response_json);
    
    logger.info(`Flow completed by ${phoneNumber}`, {
      formFields: Object.keys(flowResponse).length
    });

    // Save form submission to database
    await databaseService.createFormSubmission({
      contactId: contact.id,
      flowId: message.interactive.nfm_reply.flow_id || 'unknown',
      formData: flowResponse,
      status: 'completed'
    });
    
    // Queue confirmation message
    messageQueue.add({
      type: 'text',
      phoneNumber: phoneNumber,
      text: 'Thank you! Your form has been submitted successfully. We will get back to you soon.'
    }, 'high');

    // Log analytics
    await databaseService.createAnalyticsEntry({
      metricType: 'flow_completed',
      metricValue: {
        flowId: message.interactive.nfm_reply.flow_id,
        phoneNumber: phoneNumber,
        fieldCount: Object.keys(flowResponse).length
      }
    });

  } catch (error) {
    logger.error('Error handling flow completion:', {
      error: error.message,
      phoneNumber: message.from
    });
  }
}

/**
 * Handle interactive responses (buttons/lists)
 */
async function handleInteractiveResponse(message, contact) {
  try {
    const messageLibraryService = require('./messageLibraryService');
    const result = await messageLibraryService.processInteractiveResponse(message.interactive);
    
    if (result && result.nextMessage) {
      // Send the next message automatically
      messageQueue.add({
        type: 'library_message',
        phoneNumber: message.from,
        messageTemplate: result.nextMessage
      }, 'high');

      // Update session
      await databaseService.updateSession(contact.id, {
        lastTrigger: result.trigger.triggerId
      });

      logger.info(`Interactive response processed: ${result.trigger.triggerId}`);
    } else {
      logger.debug('No matching trigger found for interactive response');
      
      // Send default response
      messageQueue.add({
        type: 'text',
        phoneNumber: message.from,
        text: 'Thank you for your response!'
      }, 'normal');
    }
  } catch (error) {
    logger.error('Error handling interactive response:', error);
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
async function handleMessageStatus(status) {
  try {
    // Update message log status in database
    if (status.id) {
      await databaseService.updateMessageLogStatus(status.id, status.status.toUpperCase());
    }

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
  } catch (error) {
    logger.error('Error handling message status:', error);
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