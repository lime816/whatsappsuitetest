const axios = require('axios');
const { validateWhatsAppCredentials } = require('../utils/whatsappValidator');

/**
 * WhatsApp Business API Service
 */
class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    // Validate credentials on initialization
    const validation = validateWhatsAppCredentials();
    if (!validation.isValid) {
      console.warn('⚠️  WhatsApp API credentials not fully configured:', validation.missing.join(', '));
    }
  }

  /**
   * Ensure credentials are available for API calls
   * @private
   */
  _validateCredentials() {
    const validation = validateWhatsAppCredentials();
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
  }

  /**
   * Test WhatsApp API connection
   */
  async testConnection() {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        success: true,
        phoneNumber: response.data.display_phone_number,
        verifiedName: response.data.verified_name,
        status: 'connected'
      };
    } catch (error) {
      console.error('WhatsApp connection test failed:', error.response?.data || error.message);
      throw new Error(`WhatsApp API connection failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send flow message to a phone number - FIXED VERSION
   */
  async sendFlowMessage(phoneNumber, flowId, message = 'Please complete this form:') {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      // CORRECTED WhatsApp Flow message format
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'interactive',
        interactive: {
          type: 'flow',
          header: {
            type: 'text',
            text: 'Complete Form'
          },
          body: {
            text: message
          },
          footer: {
            text: 'Powered by WhatsApp Flows'
          },
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_token: `flow_token_${Date.now()}`,
              flow_id: flowId,
              flow_cta: 'Open Form',
              flow_action: 'navigate',
              flow_action_payload: {
                screen: 'RECOMMEND',
                data: {
                  user_name: '',
                  user_phone: phoneNumber,
                  form_type: 'registration',
                  timestamp: new Date().toISOString()
                }
              }
            }
          }
        }
      };

      console.log(`📤 Sending flow message to ${phoneNumber}:`, {
        flowId,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Flow message sent successfully:', {
        messageId: response.data.messages?.[0]?.id,
        phoneNumber,
        flowId
      });

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        phoneNumber,
        flowId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending flow message:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.error?.message || error.message;
      const errorCode = error.response?.data?.error?.code;
      
      throw new Error(`Failed to send flow message: ${errorMessage} (Code: ${errorCode})`);
    }
  }

  /**
   * Send interactive message with buttons or lists
   */
  async sendInteractiveMessage(phoneNumber, interactive) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'interactive',
        interactive: interactive
      };

      console.log(`📤 Sending interactive message to ${phoneNumber}:`, JSON.stringify(interactive, null, 2));

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Interactive message sent successfully:', {
        messageId: response.data.messages?.[0]?.id,
        phoneNumber
      });

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        phoneNumber,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending interactive message:', error.response?.data || error.message);
      throw new Error(`Failed to send interactive message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send simple text message
   */
  async sendTextMessage(phoneNumber, text) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: text
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        phoneNumber,
        text,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending text message:', error.response?.data || error.message);
      throw new Error(`Failed to send text message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Upload media file to WhatsApp
   */
  async uploadMedia(filePath, mimeType) {
    this._validateCredentials();

    const FormData = require('form-data');
    const fs = require('fs');

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/media`;
      
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', fs.createReadStream(filePath), {
        contentType: mimeType,
        filename: require('path').basename(filePath)
      });
      formData.append('type', mimeType);

      console.log(`📤 Uploading media file: ${filePath}`);

      const response = await axios.post(url, formData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('✅ Media uploaded successfully:', response.data);

      return {
        success: true,
        mediaId: response.data.id
      };

    } catch (error) {
      console.error('❌ Error uploading media:', error.response?.data || error.message);
      throw new Error(`Failed to upload media: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Create a new flow in WhatsApp Business Manager
   */
  async createFlow(flowName, categories = ['SIGN_UP']) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${this.businessAccountId}/flows`;
      
      const payload = {
        name: flowName.trim(),
        categories: categories
      };

      console.log(`📤 Creating flow: ${flowName}`);

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Flow created successfully:', response.data);

      return {
        success: true,
        flowId: response.data.id,
        name: flowName,
        status: 'DRAFT'
      };

    } catch (error) {
      console.error('❌ Error creating flow:', error.response?.data || error.message);
      throw new Error(`Failed to create flow: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Update flow with builder JSON
   */
  async updateFlowWithBuilderJson(flowId, flowJson, flowName) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${flowId}/assets`;
      
      const payload = {
        name: flowName,
        asset_type: 'FLOW_JSON',
        flow_json: JSON.stringify(flowJson)
      };

      console.log(`📤 Updating flow ${flowId} with JSON`);

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Flow JSON updated successfully');

      return {
        success: true,
        flowId: flowId,
        assetId: response.data.id,
        message: 'Flow JSON updated successfully'
      };

    } catch (error) {
      console.error('❌ Error updating flow JSON:', error.response?.data || error.message);
      throw new Error(`Failed to update flow JSON: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get all flows from WhatsApp Business Account
   */
  async getAllFlows() {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${this.businessAccountId}/flows`;
      
      console.log(`📤 Getting all flows`);

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      console.log('✅ Flows retrieved successfully:', response.data.data?.length || 0);

      return {
        success: true,
        data: response.data.data || [],
        paging: response.data.paging
      };

    } catch (error) {
      console.error('❌ Error getting flows:', error.response?.data || error.message);
      throw new Error(`Failed to get flows: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get flow details
   */
  async getFlowDetails(flowId) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${flowId}`;
      
      console.log(`📤 Getting flow details: ${flowId}`);

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      console.log('✅ Flow details retrieved successfully');

      return {
        success: true,
        ...response.data
      };

    } catch (error) {
      console.error('❌ Error getting flow details:', error.response?.data || error.message);
      throw new Error(`Failed to get flow details: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Approve/publish a flow
   */
  async approveFlow(flowId) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${flowId}`;
      
      const payload = {
        status: 'PUBLISHED'
      };

      console.log(`📤 Approving flow: ${flowId}`);

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Flow approval submitted successfully');

      return {
        success: true,
        flowId: flowId,
        status: 'PUBLISHED',
        message: 'Flow submitted for approval'
      };

    } catch (error) {
      console.error('❌ Error approving flow:', error.response?.data || error.message);
      
      // Handle specific approval errors
      const errorMessage = error.response?.data?.error?.message || error.message;
      if (errorMessage.includes('review')) {
        return {
          success: false,
          message: 'Flow submitted for WhatsApp review (24-72 hours)',
          requiresReview: true
        };
      }
      
      throw new Error(`Failed to approve flow: ${errorMessage}`);
    }
  }

  /**
   * Delete a flow
   */
  async deleteFlow(flowId) {
    this._validateCredentials();

    try {
      const url = `${this.baseUrl}/${flowId}`;
      
      console.log(`📤 Deleting flow: ${flowId}`);

      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      console.log('✅ Flow deleted successfully');

      return {
        success: true,
        flowId: flowId,
        message: 'Flow deleted successfully'
      };

    } catch (error) {
      console.error('❌ Error deleting flow:', error.response?.data || error.message);
      throw new Error(`Failed to delete flow: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send document message
   */
  async sendDocument(phoneNumber, filePath, caption = '', filename = null) {
    this._validateCredentials();

    try {
      // Step 1: Upload the document
      const uploadResult = await this.uploadMedia(filePath, 'application/pdf');
      const mediaId = uploadResult.mediaId;

      // Step 2: Send document message with media ID
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'document',
        document: {
          id: mediaId,
          caption: caption,
          filename: filename || require('path').basename(filePath)
        }
      };

      console.log(`📤 Sending document to ${phoneNumber}`);

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Document sent successfully');

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        phoneNumber,
        mediaId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error sending document:', error.response?.data || error.message);
      throw new Error(`Failed to send document: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// Create service instance
const whatsappService = new WhatsAppService();

/**
 * Create flow (exported function)
 */
async function createFlow(flowName, categories) {
  return await whatsappService.createFlow(flowName, categories);
}

/**
 * Update flow with JSON (exported function)
 */
async function updateFlowWithBuilderJson(flowId, flowJson, flowName) {
  return await whatsappService.updateFlowWithBuilderJson(flowId, flowJson, flowName);
}

/**
 * Get all flows (exported function)
 */
async function getAllFlows() {
  return await whatsappService.getAllFlows();
}

/**
 * Get flow details (exported function)
 */
async function getFlowDetails(flowId) {
  return await whatsappService.getFlowDetails(flowId);
}

/**
 * Approve flow (exported function)
 */
async function approveFlow(flowId) {
  return await whatsappService.approveFlow(flowId);
}

/**
 * Delete flow (exported function)
 */
async function deleteFlow(flowId) {
  return await whatsappService.deleteFlow(flowId);
}

/**
 * Get flow analytics (exported function)
 */
async function getFlowAnalytics(flowId, period) {
  return await whatsappService.getFlowAnalytics(flowId, period);
}

/**
 * Send document (exported function)
 */
async function sendDocument(phoneNumber, filePath, caption, filename) {
  return await whatsappService.sendDocument(phoneNumber, filePath, caption, filename);
}

/**
 * Test WhatsApp connection (exported function)
 */
async function testWhatsAppConnection() {
  return await whatsappService.testConnection();
}

module.exports = {
  WhatsAppService,
  sendFlowMessage,
  sendTextMessage,
  sendDocument,
  testWhatsAppConnection,
  createFlow,
  updateFlowWithBuilderJson,
  getAllFlows,
  getFlowDetails,
  approveFlow,
  deleteFlow,
  getFlowAnalytics,
  whatsappService
};