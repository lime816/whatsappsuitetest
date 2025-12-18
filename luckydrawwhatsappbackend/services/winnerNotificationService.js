/**
 * Winner Notification Service
 * Handles sending congratulatory messages to lucky draw winners
 */

const axios = require('axios');

class WinnerNotificationService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
  }

  /**
   * Send winner notification using WhatsApp template
   * @param {string} recipientPhone - Winner's phone number (with country code)
   * @param {string} recipientName - Winner's name
   * @param {string} prizePosition - Prize position (1st, 2nd, 3rd, etc.)
   * @returns {Promise<Object>} WhatsApp API response
   */
  async sendWinnerNotification(recipientPhone, recipientName, prizePosition) {
    try {
      console.log(`📱 Sending winner notification to ${recipientPhone}`);
      console.log(`🏆 Winner: ${recipientName}, Prize: ${prizePosition}`);

      // Format phone number to ensure it has country code
      let formattedPhone = recipientPhone.replace(/[\s\-\(\)]/g, '').trim();
      
      // Remove any existing country code and add +91
      if (formattedPhone.startsWith('+91')) {
        formattedPhone = formattedPhone.substring(3);
      } else if (formattedPhone.startsWith('91')) {
        formattedPhone = formattedPhone.substring(2);
      }
      
      // Ensure it's exactly 10 digits for Indian numbers
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        console.error(`❌ Invalid phone number format: ${recipientPhone} -> ${formattedPhone}`);
        throw new Error(`Invalid phone number format: ${recipientPhone}`);
      }

      // Use text message instead of template for better reliability
      const message = `Hello ${recipientName},

We're thrilled to inform you that you have won the ${prizePosition} prize in the Elanadu Lucky Draw Contest!

Our team will contact you soon with details on how to claim your prize.

Thank you for participating and being part of the celebration!`;

      const messageData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message
        }
      };

      console.log('📤 Sending WhatsApp message with data:', JSON.stringify(messageData, null, 2));

      const response = await axios.post(this.baseUrl, messageData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Winner notification sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        recipientPhone: formattedPhone,
        recipientName,
        prizePosition
      };

    } catch (error) {
      console.error('❌ Failed to send winner notification:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        recipientPhone,
        recipientName,
        prizePosition
      };
    }
  }

  /**
   * Send winner notification using simple text message (fallback)
   * @param {string} recipientPhone - Winner's phone number (with country code)
   * @param {string} recipientName - Winner's name
   * @param {string} prizePosition - Prize position (1st, 2nd, 3rd, etc.)
   * @returns {Promise<Object>} WhatsApp API response
   */
  async sendWinnerNotificationText(recipientPhone, recipientName, prizePosition) {
    try {
      console.log(`📱 Sending text winner notification to ${recipientPhone}`);
      console.log(`🏆 Winner: ${recipientName}, Prize: ${prizePosition}`);

      // Format phone number to ensure it has country code
      let formattedPhone = recipientPhone.replace(/[\s\-\(\)]/g, '').trim();
      if (!formattedPhone.startsWith('+')) {
        // Assume Indian number if no country code
        formattedPhone = '+91' + formattedPhone;
      }

      const message = `Hello ${recipientName},

We're thrilled to inform you that you have won the ${prizePosition} prize in the Elanadu Lucky Draw Contest!

Our team will contact you soon with details on how to claim your prize.

Thank you for participating and being part of the celebration!`;

      const messageData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message
        }
      };

      console.log('📤 Sending WhatsApp text message to:', formattedPhone);

      const response = await axios.post(this.baseUrl, messageData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Winner text notification sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        recipientPhone: formattedPhone,
        recipientName,
        prizePosition,
        messageType: 'text'
      };

    } catch (error) {
      console.error('❌ Failed to send winner text notification:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        recipientPhone,
        recipientName,
        prizePosition,
        messageType: 'text'
      };
    }
  }

  /**
   * Send notifications to multiple winners
   * @param {Array} winners - Array of winner objects with phone, name, and position
   * @param {boolean} useTextFallback - Whether to fallback to text messages if template fails
   * @returns {Promise<Array>} Array of notification results
   */
  async sendBulkWinnerNotifications(winners, useTextFallback = true) {
    console.log(`📢 Sending notifications to ${winners.length} winners`);
    
    const results = [];
    
    for (const winner of winners) {
      try {
        // Send template message first (hello_world)
        let templateResult = await this.sendWinnerNotification(
          winner.phoneNumber,
          winner.name,
          winner.position
        );
        
        // Always send personalized text message after template
        console.log(`📝 Sending personalized message to ${winner.name}...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        
        let textResult = await this.sendWinnerNotificationText(
          winner.phoneNumber,
          winner.name,
          winner.position
        );
        
        // Combine results
        const combinedResult = {
          success: templateResult.success || textResult.success,
          templateSent: templateResult.success,
          textSent: textResult.success,
          recipientPhone: winner.phoneNumber,
          recipientName: winner.name,
          prizePosition: winner.position,
          templateMessageId: templateResult.messageId,
          textMessageId: textResult.messageId
        };
        
        results.push(combinedResult);
        
        // Add delay between winners to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to send notification to ${winner.name}:`, error);
        results.push({
          success: false,
          error: error.message,
          recipientPhone: winner.phoneNumber,
          recipientName: winner.name,
          prizePosition: winner.position
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`📊 Notification Summary: ${successCount} sent, ${failureCount} failed`);
    
    return {
      total: winners.length,
      successful: successCount,
      failed: failureCount,
      results
    };
  }

  /**
   * Validate template parameters
   * @param {string} recipientName - Winner's name
   * @param {string} prizePosition - Prize position
   * @returns {Object} Validation result
   */
  validateParameters(recipientName, prizePosition) {
    const errors = [];
    
    if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length === 0) {
      errors.push('Recipient name is required and must be a non-empty string');
    }
    
    if (!prizePosition || typeof prizePosition !== 'string' || prizePosition.trim().length === 0) {
      errors.push('Prize position is required and must be a non-empty string');
    }
    
    // Validate prize position format
    const validPositions = /^(1st|2nd|3rd|\d+th)$/i;
    if (prizePosition && !validPositions.test(prizePosition)) {
      errors.push('Prize position must be in format: 1st, 2nd, 3rd, 4th, etc.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = WinnerNotificationService;
