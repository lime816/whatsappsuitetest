const logger = require('./logger');
const { whatsappRateLimiter } = require('./rateLimiter');

class MessageQueue {
  constructor() {
    this.queues = {
      high: [],    // Immediate responses (user interactions)
      normal: [],  // Regular messages
      low: []      // Bulk/marketing messages
    };
    
    this.processing = false;
    this.stats = {
      processed: 0,
      failed: 0,
      queued: 0
    };

    // Start processing queue
    this.startProcessing();
  }

  add(message, priority = 'normal') {
    if (!this.queues[priority]) {
      priority = 'normal';
    }

    const queueItem = {
      id: Date.now() + Math.random(),
      message,
      priority,
      addedAt: Date.now(),
      attempts: 0,
      maxAttempts: 3
    };

    this.queues[priority].push(queueItem);
    this.stats.queued++;

    logger.debug(`Message queued: ${priority} priority`, {
      id: queueItem.id,
      queueSize: this.getQueueSize()
    });

    return queueItem.id;
  }

  async startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    logger.info('Message queue processing started');

    while (this.processing) {
      try {
        const item = this.getNextItem();
        
        if (item) {
          await this.processItem(item);
        } else {
          // No items to process, wait a bit
          await this.sleep(100);
        }
      } catch (error) {
        logger.error('Queue processing error:', error);
        await this.sleep(1000); // Wait longer on error
      }
    }
  }

  getNextItem() {
    // Process in priority order: high -> normal -> low
    for (const priority of ['high', 'normal', 'low']) {
      if (this.queues[priority].length > 0) {
        return this.queues[priority].shift();
      }
    }
    return null;
  }

  async processItem(item) {
    try {
      // Check rate limit
      if (!whatsappRateLimiter.isAllowed(item.message.phoneNumber)) {
        // Put back in queue and wait
        this.queues[item.priority].unshift(item);
        await this.sleep(1000);
        return;
      }

      // Process the message
      await this.executeMessage(item);
      
      this.stats.processed++;
      logger.debug(`Message processed successfully`, {
        id: item.id,
        processingTime: Date.now() - item.addedAt
      });

    } catch (error) {
      item.attempts++;
      
      if (item.attempts < item.maxAttempts) {
        // Retry with exponential backoff
        const delay = Math.pow(2, item.attempts) * 1000;
        setTimeout(() => {
          this.queues[item.priority].push(item);
        }, delay);
        
        logger.warn(`Message retry scheduled`, {
          id: item.id,
          attempt: item.attempts,
          delay
        });
      } else {
        this.stats.failed++;
        logger.error(`Message failed after max attempts`, {
          id: item.id,
          attempts: item.attempts,
          error: error.message
        });
      }
    }
  }

  async executeMessage(item) {
    const { message } = item;
    
    // Import WhatsApp service dynamically to avoid circular dependency
    const { sendFlowMessage, sendTextMessage, sendInteractiveMessage } = require('../services/whatsappService');
    
    switch (message.type) {
      case 'flow':
        return await sendFlowMessage(message.phoneNumber, message.flowId, message.text);
      
      case 'text':
        return await sendTextMessage(message.phoneNumber, message.text);
      
      case 'interactive':
        return await sendInteractiveMessage(message.phoneNumber, message.interactive);
      
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  getQueueSize() {
    return {
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length,
      total: this.queues.high.length + this.queues.normal.length + this.queues.low.length
    };
  }

  getStats() {
    return {
      ...this.stats,
      queueSize: this.getQueueSize(),
      processing: this.processing
    };
  }

  stop() {
    this.processing = false;
    logger.info('Message queue processing stopped');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const messageQueue = new MessageQueue();

module.exports = messageQueue;