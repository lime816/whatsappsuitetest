const { sendTextMessage } = require('./whatsappService');
const { handleSalonBookingFlow } = require('./salonBookingService');

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
    }
  }
}

/**
 * Handle individual incoming messages
 */
async function handleIncomingMessage(message) {
  try {
    console.log(`📱 Processing message from ${message.from}:`, JSON.stringify(message, null, 2));

    // Try to handle with Lucky Draw flow
    const handled = await handleLuckyDrawFlow(message);
    
    if (handled) {
      console.log('✅ Message handled by Lucky Draw flow');
      return;
    }

    // If not handled, send help message
    console.log('📝 Message not recognized, sending help message');
    await sendTextMessage(
      message.from,
      'Welcome! Send "Join" to enter the Lucky Draw contest. 🎉'
    );

  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
  }
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
