const { whatsappService } = require('./whatsappService');
const databaseService = require('./databaseService');
const logger = require('../utils/logger');

// Message Library Integration Service
class MessageLibraryService {
  constructor() {
    // Initialize with default messages if database is empty
    this.initializeDefaultMessages();
  }

  async initializeDefaultMessages() {
    try {
      // Check if we have any message templates
      const existingMessages = await databaseService.getMessageTemplates();
      
      if (existingMessages.length === 0) {
        logger.info('Initializing default message templates...');
        await this.seedDefaultMessages();
      }
    } catch (error) {
      logger.warn('Could not initialize default messages (database may not be ready):', error.message);
    }
  }

  // Seed default messages into database
  async seedDefaultMessages() {
    const defaultMessages = [
      {
        messageId: 'msg_welcome_interactive',
        name: 'Welcome - Interactive Menu',
        type: 'INTERACTIVE_BUTTON',
        status: 'PUBLISHED',
        category: 'welcome',
        tags: ['welcome', 'menu', 'interactive'],
        contentPayload: {
          header: 'Welcome to Hospital Services! 🏥',
          body: 'Hello! How can we assist you today? Please choose an option below:',
          footer: 'Powered by Hospital Management System',
          buttons: [
            {
              buttonId: 'btn_book_appointment',
              title: '📅 Book Appointment',
              triggerId: 'trigger_book_appointment',
              nextAction: 'send_message',
              targetMessageId: 'msg_book_interactive'
            },
            {
              buttonId: 'btn_lab_tests',
              title: '🧪 Lab Tests',
              triggerId: 'trigger_lab_tests',
              nextAction: 'send_message',
              targetMessageId: 'msg_lab_interactive'
            },
            {
              buttonId: 'btn_emergency',
              title: '🚨 Emergency',
              triggerId: 'trigger_emergency',
              nextAction: 'send_message',
              targetMessageId: 'msg_emergency'
            }
          ]
        }
      },
      {
        messageId: 'msg_book_interactive',
        name: 'Book Appointment - Interactive',
        type: 'INTERACTIVE_BUTTON',
        status: 'PUBLISHED',
        category: 'appointment',
        tags: ['appointment', 'booking'],
        contentPayload: {
          header: 'Book Your Appointment 📅',
          body: 'Which type of appointment would you like to book?',
          footer: 'Select your preferred option',
          buttons: [
            {
              buttonId: 'btn_general_checkup',
              title: '👩‍⚕️ General Checkup',
              triggerId: 'trigger_general_checkup',
              nextAction: 'send_message',
              targetMessageId: 'msg_doctor_selection'
            },
            {
              buttonId: 'btn_specialist',
              title: '🩺 Specialist',
              triggerId: 'trigger_specialist',
              nextAction: 'send_message',
              targetMessageId: 'msg_specialist_selection'
            },
            {
              buttonId: 'btn_back_main',
              title: '⬅️ Back to Main',
              triggerId: 'trigger_back_main',
              nextAction: 'send_message',
              targetMessageId: 'msg_welcome_interactive'
            }
          ]
        }
      }
    ];

    const defaultTriggers = [
      {
        triggerId: 'trigger_book_appointment',
        triggerType: 'BUTTON_CLICK',
        triggerValue: { buttonId: 'btn_book_appointment' },
        nextAction: 'send_message',
        targetId: 'msg_book_interactive',
        isActive: true
      },
      {
        triggerId: 'trigger_hi',
        triggerType: 'KEYWORD_MATCH',
        triggerValue: { keywords: ['hi', 'hello', 'hey', 'start', 'menu'] },
        nextAction: 'send_message',
        targetId: 'msg_welcome_interactive',
        isActive: true
      }
    ];

    try {
      // Create message templates
      for (const message of defaultMessages) {
        await databaseService.createMessageTemplate(message);
      }

      // Create triggers
      for (const trigger of defaultTriggers) {
        await databaseService.createTrigger(trigger);
      }

      logger.info(`Seeded ${defaultMessages.length} message templates and ${defaultTriggers.length} triggers`);
    } catch (error) {
      logger.error('Error seeding default messages:', error);
    }
  }

  // Get all published messages
  async getPublishedMessages() {
    try {
      return await databaseService.getMessageTemplates({ status: 'PUBLISHED' });
    } catch (error) {
      logger.error('Error getting published messages:', error);
      return [];
    }
  }

  // Get all messages
  async getAllMessages() {
    try {
      return await databaseService.getMessageTemplates();
    } catch (error) {
      logger.error('Error getting all messages:', error);
      return [];
    }
  }

  // Get message by ID
  async getMessageById(messageId) {
    try {
      return await databaseService.getMessageTemplateByMessageId(messageId);
    } catch (error) {
      logger.error('Error getting message by ID:', error);
      return null;
    }
  }

  // Create new message
  async createMessage(messageData) {
    try {
      const newMessage = {
        messageId: messageData.messageId || `msg_${Date.now()}`,
        name: messageData.name,
        type: messageData.type,
        status: messageData.status || 'DRAFT',
        contentPayload: messageData.contentPayload,
        category: messageData.category,
        tags: messageData.tags || []
      };

      return await databaseService.createMessageTemplate(newMessage);
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  // Update message
  async updateMessage(id, updateData) {
    try {
      return await databaseService.updateMessageTemplate(id, updateData);
    } catch (error) {
      logger.error('Error updating message:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(id) {
    try {
      return await databaseService.deleteMessageTemplate(id);
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  // Find matching triggers for a message
  async findMatchingTriggers(messageText) {
    try {
      const triggers = await databaseService.getTriggers({ isActive: true });
      const normalizedText = messageText.toLowerCase().trim();
      
      const matchingTriggers = triggers.filter(trigger => {
        if (trigger.triggerType === 'KEYWORD_MATCH') {
          const keywords = trigger.triggerValue.keywords || [];
          return keywords.some(keyword => 
            normalizedText.includes(keyword.toLowerCase())
          );
        }
        return false;
      });

      return matchingTriggers;
    } catch (error) {
      logger.error('Error finding matching triggers:', error);
      return [];
    }
  }

  // Find matching triggers for button interactions
  async findButtonTrigger(buttonId) {
    try {
      const triggers = await databaseService.getTriggers({ 
        isActive: true,
        triggerType: 'BUTTON_CLICK'
      });
      
      return triggers.find(trigger => 
        trigger.triggerValue.buttonId === buttonId
      );
    } catch (error) {
      logger.error('Error finding button trigger:', error);
      return null;
    }
  }

  // Find matching triggers for list selections
  async findListTrigger(listItemId) {
    try {
      const triggers = await databaseService.getTriggers({ 
        isActive: true,
        triggerType: 'LIST_SELECTION'
      });
      
      return triggers.find(trigger => 
        trigger.triggerValue.listItemId === listItemId
      );
    } catch (error) {
      logger.error('Error finding list trigger:', error);
      return null;
    }
  }

  // Process interactive message response
  async processInteractiveResponse(interactiveData) {
    try {
      let matchingTrigger = null;
      
      if (interactiveData.type === 'button_reply') {
        matchingTrigger = await this.findButtonTrigger(interactiveData.button_reply.id);
      } else if (interactiveData.type === 'list_reply') {
        matchingTrigger = await this.findListTrigger(interactiveData.list_reply.id);
      }
      
      if (matchingTrigger) {
        // Update trigger usage
        await databaseService.updateTriggerUsage(matchingTrigger.id);
        
        const nextMessage = await this.getMessageById(matchingTrigger.targetId);
        
        logger.info(`Found interactive trigger: ${matchingTrigger.triggerId} for ${interactiveData.type}`);
        return {
          trigger: matchingTrigger,
          nextMessage
        };
      }
      
      logger.debug('No matching trigger found for interactive response:', interactiveData);
      return null;
    } catch (error) {
      logger.error('Error processing interactive response:', error);
      return null;
    }
  }

  // Get button information from a message
  getMessageButtons(message) {
    if (!message || !message.contentPayload.buttons) {
      return [];
    }
    
    return message.contentPayload.buttons.map(button => ({
      buttonId: button.buttonId,
      title: button.title,
      triggerId: button.triggerId,
      nextAction: button.nextAction,
      targetMessageId: button.targetMessageId
    }));
  }

  // Get list options from a message
  getMessageListOptions(message) {
    if (!message || !message.contentPayload.sections) {
      return [];
    }
    
    const options = [];
    message.contentPayload.sections.forEach(section => {
      section.rows.forEach(row => {
        options.push({
          rowId: row.rowId,
          title: row.title,
          description: row.description,
          triggerId: row.triggerId,
          nextAction: row.nextAction,
          targetMessageId: row.targetMessageId
        });
      });
    });
    
    return options;
  }

  // Send message using WhatsApp API
  async sendLibraryMessage(messageEntry, recipientPhone) {
    try {
      logger.info('Sending library message:', {
        type: messageEntry.type,
        to: recipientPhone,
        messageId: messageEntry.messageId
      });

      // Log the message attempt
      const contact = await databaseService.getContactByPhone(recipientPhone) || 
                     await databaseService.createContact({ phoneNumber: recipientPhone });

      let result;
      
      switch (messageEntry.type) {
        case 'STANDARD_TEXT':
          result = await whatsappService.sendTextMessage(
            recipientPhone, 
            messageEntry.contentPayload.body
          );
          break;

        case 'INTERACTIVE_BUTTON':
          const payload = messageEntry.contentPayload;
          const interactive = {
            type: 'button',
            body: { text: payload.body || '' },
            action: {
              buttons: (payload.buttons || []).slice(0, 3).map(btn => ({
                type: 'reply',
                reply: {
                  id: btn.buttonId || btn.id,
                  title: btn.title
                }
              }))
            }
          };

          if (payload.header) {
            interactive.header = { type: 'text', text: payload.header };
          }
          if (payload.footer) {
            interactive.footer = { text: payload.footer };
          }

          result = await whatsappService.sendInteractiveMessage(recipientPhone, interactive);
          break;

        case 'INTERACTIVE_LIST':
          const listPayload = messageEntry.contentPayload;
          const listInteractive = {
            type: 'list',
            body: { text: listPayload.body || '' },
            action: {
              button: listPayload.buttonText || 'View Options',
              sections: (listPayload.sections || []).map(section => ({
                title: section.title,
                rows: (section.rows || []).map(row => ({
                  id: row.rowId || row.id,
                  title: row.title,
                  description: row.description
                }))
              }))
            }
          };

          if (listPayload.header) {
            listInteractive.header = { type: 'text', text: listPayload.header };
          }
          if (listPayload.footer) {
            listInteractive.footer = { text: listPayload.footer };
          }

          result = await whatsappService.sendInteractiveMessage(recipientPhone, listInteractive);
          break;

        default:
          throw new Error(`Unsupported message type: ${messageEntry.type}`);
      }

      // Log the successful message
      if (result.success) {
        await databaseService.createMessageLog({
          contactId: contact.id,
          messageTemplateId: messageEntry.id,
          whatsappMessageId: result.messageId,
          messageType: messageEntry.type,
          content: messageEntry.contentPayload,
          status: 'SENT'
        });
      }

      return result;
    } catch (error) {
      logger.error('Error sending library message:', error);
      throw error;
    }
  }

  // Create trigger
  async createTrigger(triggerData) {
    try {
      const newTrigger = {
        triggerId: triggerData.triggerId || `trigger_${Date.now()}`,
        triggerType: triggerData.triggerType,
        triggerValue: triggerData.triggerValue,
        nextAction: triggerData.nextAction,
        targetId: triggerData.targetId,
        messageTemplateId: triggerData.messageTemplateId,
        flowId: triggerData.flowId,
        isActive: triggerData.isActive ?? true,
        priority: triggerData.priority ?? 0,
        conditions: triggerData.conditions
      };
      
      return await databaseService.createTrigger(newTrigger);
    } catch (error) {
      logger.error('Error creating trigger:', error);
      throw error;
    }
  }

  // Get all triggers
  async getAllTriggers() {
    try {
      return await databaseService.getTriggers();
    } catch (error) {
      logger.error('Error getting all triggers:', error);
      return [];
    }
  }
}

module.exports = new MessageLibraryService();