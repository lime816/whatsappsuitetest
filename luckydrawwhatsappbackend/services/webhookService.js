const { sendTextMessage, sendFlowMessage } = require('./whatsappService');
const { findMatchingTrigger } = require('./triggerService');

/**
 * Process incoming webhook payload from WhatsApp Business API
 */
async function processWebhookPayload(payload) {
  if (payload.object !== 'whatsapp_business_account') {
    console.log('📝 Not a WhatsApp Business webhook, ignoring');
    return;
  }

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field === 'messages' && change.value.messages) {
        for (const message of change.value.messages) {
          await handleIncomingMessage(message);
        }
      }

      // Handle message status updates (delivery, read, etc.)
      if (change.field === 'messages' && change.value.statuses) {
        for (const status of change.value.statuses) {
          handleMessageStatus(status);
        }
      }

      // Handle interactive message responses (flow completions, button clicks)
      if (change.field === 'messages' && change.value.messages) {
        for (const message of change.value.messages) {
          if (message.type === 'interactive') {
            await handleInteractiveMessage(message);
          }
        }
      }
    }
  }
}

/**
 * Handle individual incoming messages
 */
async function handleIncomingMessage(message) {
  try {
    console.log(`📱 Processing message from ${message.from}:`, JSON.stringify(message, null, 2));

    // Extract message text
    let messageText = '';
    if (message.type === 'text' && message.text) {
      messageText = message.text.body.trim();
    }

    // Skip if no text content
    if (!messageText) {
      console.log('📝 No text content, skipping trigger matching');
      return;
    }

    // Try to find matching trigger
    const matchingTrigger = findMatchingTrigger(messageText);
    
    if (matchingTrigger) {
      console.log(`🎯 Found matching trigger: "${matchingTrigger.keyword}" -> Flow ID: ${matchingTrigger.flowId}`);
      
      try {
        // Send flow message based on trigger
        await sendFlowMessage(
          message.from,
          matchingTrigger.flowId,
          matchingTrigger.message
        );
        
        console.log('✅ Flow message sent successfully');
        return;
      } catch (error) {
        console.error('❌ Error sending flow message:', error);
        // Fallback to text message
        await sendTextMessage(
          message.from,
          matchingTrigger.message || 'Thank you for your message. Please try again.'
        );
      }
    }

    // If no trigger matched, send default help message
    console.log('📝 No matching trigger found, sending default help message');
    await sendDefaultHelpMessage(message.from);

  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
    await sendTextMessage(
      message.from,
      'Sorry, something went wrong. Please try again later.'
    );
  }
}

/**
 * Handle interactive messages (flow responses, button clicks)
 */
async function handleInteractiveMessage(message) {
  try {
    console.log(`🔄 Processing interactive message from ${message.from}`);

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
    console.error('❌ Error handling interactive message:', error);
  }
}

/**
 * Handle WhatsApp Flow completion
 */
async function handleFlowCompletion(message) {
  try {
    const phoneNumber = message.from;
    const flowResponse = JSON.parse(message.interactive.nfm_reply.response_json);
    
    console.log(`📋 Flow completed by ${phoneNumber}:`, flowResponse);
    
    // Send confirmation message
    await sendTextMessage(
      phoneNumber,
      'Thank you! Your form has been submitted successfully. We will get back to you soon.'
    );

    // Here you can add custom logic to process the form data
    // For example: save to database, send notifications, etc.
    await processFormData(phoneNumber, flowResponse);

  } catch (error) {
    console.error('❌ Error handling flow completion:', error);
  }
}

/**
 * Handle button clicks
 */
async function handleButtonClick(message) {
  const buttonId = message.interactive.button_reply.id;
  const phoneNumber = message.from;
  
  console.log(`🔘 Button clicked: ${buttonId} by ${phoneNumber}`);
  
  // You can add custom button handling logic here
  await sendTextMessage(
    phoneNumber,
    `You clicked: ${buttonId}. Thank you for your response!`
  );
}

/**
 * Handle list selections
 */
async function handleListSelection(message) {
  const listItemId = message.interactive.list_reply.id;
  const listItemTitle = message.interactive.list_reply.title;
  const phoneNumber = message.from;
  
  console.log(`📋 List item selected: ${listItemId} (${listItemTitle}) by ${phoneNumber}`);
  
  // You can add custom list handling logic here
  await sendTextMessage(
    phoneNumber,
    `You selected: ${listItemTitle}. Thank you for your choice!`
  );
}

/**
 * Process form data from flow completion
 */
async function processFormData(phoneNumber, formData) {
  try {
    console.log(`💾 Processing form data for ${phoneNumber}:`, formData);
    
    // Add your custom form processing logic here
    // Examples:
    // - Save to database
    // - Send email notifications
    // - Trigger other workflows
    // - Update CRM systems
    
    // For now, just log the data
    console.log('✅ Form data processed successfully');
    
  } catch (error) {
    console.error('❌ Error processing form data:', error);
  }
}

/**
 * Send default help message when no triggers match
 */
async function sendDefaultHelpMessage(phoneNumber) {
  const helpMessage = `👋 Welcome! I'm here to help you.

🤖 *Available Commands:*
• Type keywords to trigger automated responses
• Use interactive buttons and menus when available

💡 *Need Help?*
Contact our support team for assistance.

Thank you for reaching out!`;

  await sendTextMessage(phoneNumber, helpMessage);
}

/**
 * Handle message status updates
 */
function handleMessageStatus(status) {
  console.log(`📊 Message status update:`, {
    id: status.id,
    status: status.status,
    timestamp: status.timestamp,
    recipient: status.recipient_id
  });
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

  console.log('🧪 Simulating webhook with text message:', messageText);
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

  console.log('🧪 Simulating interactive webhook:', interactiveData);
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
