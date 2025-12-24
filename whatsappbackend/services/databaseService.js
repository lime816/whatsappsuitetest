const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const logger = require('../utils/logger');

class DatabaseService {
  constructor() {
    // Use direct connection for better compatibility
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    console.log('🔗 Connecting to database:', connectionString.replace(/:[^:@]*@/, ':***@'));
    
    // Create PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Supabase
      }
    });
    
    // Create Prisma adapter
    const adapter = new PrismaPg(this.pool);
    
    // Initialize Prisma client with adapter
    this.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    });
    
    // Handle graceful shutdown
    process.on('beforeExit', async () => {
      await this.disconnect();
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      await this.pool.end();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Database disconnection failed:', error);
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Contact Management
  async createContact(data) {
    try {
      return await this.prisma.contact.create({
        data: {
          phoneNumber: data.phoneNumber,
          name: data.name,
          email: data.email,
          isActive: data.isActive ?? true
        }
      });
    } catch (error) {
      logger.error('Error creating contact:', error);
      throw error;
    }
  }

  async getContactByPhone(phoneNumber) {
    try {
      return await this.prisma.contact.findUnique({
        where: { phoneNumber },
        include: {
          sessions: {
            where: { isActive: true },
            orderBy: { lastActivity: 'desc' },
            take: 1
          }
        }
      });
    } catch (error) {
      logger.error('Error getting contact by phone:', error);
      throw error;
    }
  }

  async updateContact(id, data) {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Error updating contact:', error);
      throw error;
    }
  }

  // Session Management
  async createSession(data) {
    try {
      return await this.prisma.session.create({
        data: {
          contactId: data.contactId,
          lastTrigger: data.lastTrigger,
          lastActivity: new Date(),
          messageCount: data.messageCount ?? 1,
          sessionData: data.sessionData
        }
      });
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  async updateSession(contactId, data) {
    try {
      return await this.prisma.session.updateMany({
        where: { 
          contactId,
          isActive: true 
        },
        data: {
          ...data,
          lastActivity: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating session:', error);
      throw error;
    }
  }

  async getActiveSession(contactId) {
    try {
      return await this.prisma.session.findFirst({
        where: { 
          contactId,
          isActive: true 
        },
        orderBy: { lastActivity: 'desc' }
      });
    } catch (error) {
      logger.error('Error getting active session:', error);
      throw error;
    }
  }

  // Message Template Management
  async createMessageTemplate(data) {
    try {
      return await this.prisma.messageTemplate.create({
        data: {
          messageId: data.messageId,
          name: data.name,
          type: data.type,
          status: data.status ?? 'DRAFT',
          contentPayload: data.contentPayload,
          category: data.category,
          tags: data.tags ?? []
        }
      });
    } catch (error) {
      logger.error('Error creating message template:', error);
      throw error;
    }
  }

  async getMessageTemplates(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.category) where.category = filters.category;
      
      return await this.prisma.messageTemplate.findMany({
        where,
        include: {
          triggers: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error getting message templates:', error);
      throw error;
    }
  }

  async getMessageTemplateById(id) {
    try {
      return await this.prisma.messageTemplate.findUnique({
        where: { id },
        include: {
          triggers: true,
          messageLogs: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting message template by ID:', error);
      throw error;
    }
  }

  async getMessageTemplateByMessageId(messageId) {
    try {
      return await this.prisma.messageTemplate.findUnique({
        where: { messageId },
        include: {
          triggers: true
        }
      });
    } catch (error) {
      logger.error('Error getting message template by messageId:', error);
      throw error;
    }
  }

  async updateMessageTemplate(id, data) {
    try {
      return await this.prisma.messageTemplate.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Error updating message template:', error);
      throw error;
    }
  }

  async deleteMessageTemplate(id) {
    try {
      return await this.prisma.messageTemplate.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting message template:', error);
      throw error;
    }
  }

  // Trigger Management
  async createTrigger(data) {
    try {
      return await this.prisma.trigger.create({
        data: {
          triggerId: data.triggerId,
          triggerType: data.triggerType,
          triggerValue: data.triggerValue,
          nextAction: data.nextAction,
          targetId: data.targetId,
          messageTemplateId: data.messageTemplateId,
          flowId: data.flowId,
          isActive: data.isActive ?? true,
          priority: data.priority ?? 0,
          conditions: data.conditions
        }
      });
    } catch (error) {
      logger.error('Error creating trigger:', error);
      throw error;
    }
  }

  async getTriggers(filters = {}) {
    try {
      const where = {};
      
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.triggerType) where.triggerType = filters.triggerType;
      
      return await this.prisma.trigger.findMany({
        where,
        include: {
          messageTemplate: true
        },
        orderBy: [
          { priority: 'desc' },
          { usageCount: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      logger.error('Error getting triggers:', error);
      throw error;
    }
  }

  async getTriggerById(id) {
    try {
      return await this.prisma.trigger.findUnique({
        where: { id },
        include: {
          messageTemplate: true
        }
      });
    } catch (error) {
      logger.error('Error getting trigger by ID:', error);
      throw error;
    }
  }

  async getTriggerByTriggerId(triggerId) {
    try {
      return await this.prisma.trigger.findUnique({
        where: { triggerId },
        include: {
          messageTemplate: true
        }
      });
    } catch (error) {
      logger.error('Error getting trigger by triggerId:', error);
      throw error;
    }
  }

  async updateTrigger(id, data) {
    try {
      return await this.prisma.trigger.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Error updating trigger:', error);
      throw error;
    }
  }

  async updateTriggerUsage(id) {
    try {
      return await this.prisma.trigger.update({
        where: { id },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating trigger usage:', error);
      throw error;
    }
  }

  async deleteTrigger(id) {
    try {
      return await this.prisma.trigger.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting trigger:', error);
      throw error;
    }
  }

  // Flow Management
  async createFlow(data) {
    try {
      return await this.prisma.flow.create({
        data: {
          flowId: data.flowId,
          name: data.name,
          description: data.description,
          version: data.version,
          status: data.status ?? 'DRAFT',
          flowData: data.flowData
        }
      });
    } catch (error) {
      logger.error('Error creating flow:', error);
      throw error;
    }
  }

  async getFlows(filters = {}) {
    try {
      const where = {};
      if (filters.status) where.status = filters.status;
      
      return await this.prisma.flow.findMany({
        where,
        include: {
          formSubmissions: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error getting flows:', error);
      throw error;
    }
  }

  async getFlowByFlowId(flowId) {
    try {
      return await this.prisma.flow.findUnique({
        where: { flowId },
        include: {
          formSubmissions: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting flow by flowId:', error);
      throw error;
    }
  }

  // Form Submission Management
  async createFormSubmission(data) {
    try {
      return await this.prisma.formSubmission.create({
        data: {
          contactId: data.contactId,
          flowId: data.flowId,
          formData: data.formData,
          status: data.status ?? 'completed'
        }
      });
    } catch (error) {
      logger.error('Error creating form submission:', error);
      throw error;
    }
  }

  async getFormSubmissions(filters = {}) {
    try {
      const where = {};
      if (filters.contactId) where.contactId = filters.contactId;
      if (filters.flowId) where.flowId = filters.flowId;
      if (filters.status) where.status = filters.status;
      
      return await this.prisma.formSubmission.findMany({
        where,
        include: {
          contact: true,
          flow: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error getting form submissions:', error);
      throw error;
    }
  }

  // Message Log Management
  async createMessageLog(data) {
    try {
      return await this.prisma.messageLog.create({
        data: {
          contactId: data.contactId,
          messageTemplateId: data.messageTemplateId,
          whatsappMessageId: data.whatsappMessageId,
          messageType: data.messageType,
          content: data.content,
          status: data.status ?? 'SENT'
        }
      });
    } catch (error) {
      logger.error('Error creating message log:', error);
      throw error;
    }
  }

  async updateMessageLogStatus(whatsappMessageId, status, additionalData = {}) {
    try {
      const updateData = { status, ...additionalData };
      
      if (status === 'DELIVERED') updateData.deliveredAt = new Date();
      if (status === 'READ') updateData.readAt = new Date();
      
      return await this.prisma.messageLog.updateMany({
        where: { whatsappMessageId },
        data: updateData
      });
    } catch (error) {
      logger.error('Error updating message log status:', error);
      throw error;
    }
  }

  // Webhook Event Management
  async createWebhookEvent(data) {
    try {
      return await this.prisma.webhookEvent.create({
        data: {
          eventType: data.eventType,
          payload: data.payload,
          processed: data.processed ?? false,
          error: data.error
        }
      });
    } catch (error) {
      logger.error('Error creating webhook event:', error);
      throw error;
    }
  }

  async markWebhookEventProcessed(id, error = null) {
    try {
      return await this.prisma.webhookEvent.update({
        where: { id },
        data: {
          processed: true,
          error
        }
      });
    } catch (error) {
      logger.error('Error marking webhook event as processed:', error);
      throw error;
    }
  }

  // Analytics
  async createAnalyticsEntry(data) {
    try {
      return await this.prisma.analytics.create({
        data: {
          metricType: data.metricType,
          metricValue: data.metricValue,
          metadata: data.metadata
        }
      });
    } catch (error) {
      logger.error('Error creating analytics entry:', error);
      throw error;
    }
  }

  async getAnalytics(filters = {}) {
    try {
      const where = {};
      if (filters.metricType) where.metricType = filters.metricType;
      if (filters.startDate) where.timestamp = { gte: filters.startDate };
      if (filters.endDate) {
        where.timestamp = { 
          ...where.timestamp,
          lte: filters.endDate 
        };
      }
      
      return await this.prisma.analytics.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit ?? 100
      });
    } catch (error) {
      logger.error('Error getting analytics:', error);
      throw error;
    }
  }

  // System Configuration
  async getConfig(key) {
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key }
      });
      return config?.value;
    } catch (error) {
      logger.error('Error getting config:', error);
      throw error;
    }
  }

  async setConfig(key, value) {
    try {
      return await this.prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    } catch (error) {
      logger.error('Error setting config:', error);
      throw error;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;