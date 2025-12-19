const logger = require('../utils/logger');
const { triggerCache } = require('../utils/cache');
const databaseService = require('./databaseService');

/**
 * Get all triggers
 */
async function getAllTriggers() {
  try {
    const triggers = await databaseService.getTriggers();
    return triggers.map(trigger => ({
      ...trigger,
      matchCount: trigger.usageCount || 0,
      lastUsed: trigger.lastUsed
    }));
  } catch (error) {
    logger.error('Error getting all triggers:', error);
    return [];
  }
}

/**
 * Create a new trigger
 */
async function createTrigger(triggerData) {
  try {
    // Validate required fields
    if (!triggerData.keyword || !triggerData.flowId) {
      throw new Error('Keyword and flowId are required');
    }

    // Check for duplicate keywords
    const existingTriggers = await databaseService.getTriggers({ isActive: true });
    const existingTrigger = existingTriggers.find(t => {
      if (t.triggerType === 'KEYWORD_MATCH') {
        const keywords = t.triggerValue.keywords || [];
        return keywords.some(k => k.toLowerCase() === triggerData.keyword.toLowerCase());
      }
      return false;
    });
    
    if (existingTrigger) {
      throw new Error(`Trigger with keyword "${triggerData.keyword}" already exists`);
    }

    const newTrigger = {
      triggerId: `trigger_${Date.now()}`,
      triggerType: 'KEYWORD_MATCH',
      triggerValue: { keywords: [triggerData.keyword.toLowerCase().trim()] },
      nextAction: 'send_flow',
      flowId: triggerData.flowId,
      isActive: triggerData.isActive !== false,
      priority: 0
    };

    const createdTrigger = await databaseService.createTrigger(newTrigger);
    
    // Clear cache
    triggerCache.clear();
    
    logger.info(`Created new trigger: "${triggerData.keyword}"`, {
      flowId: triggerData.flowId,
      triggerId: createdTrigger.triggerId
    });
    
    return createdTrigger;
  } catch (error) {
    logger.error('Error creating trigger:', error);
    throw error;
  }
}

/**
 * Update an existing trigger
 */
async function updateTrigger(id, updates) {
  try {
    // Validate keyword uniqueness if keyword is being updated
    if (updates.keyword) {
      const normalizedKeyword = updates.keyword.toLowerCase().trim();
      const existingTriggers = await databaseService.getTriggers({ isActive: true });
      const existingTrigger = existingTriggers.find(t => 
        t.id !== id && 
        t.triggerType === 'KEYWORD_MATCH' &&
        t.triggerValue.keywords?.includes(normalizedKeyword)
      );
      
      if (existingTrigger) {
        throw new Error(`Trigger with keyword "${normalizedKeyword}" already exists`);
      }
      
      // Update the trigger value with new keyword
      updates.triggerValue = { keywords: [normalizedKeyword] };
      delete updates.keyword; // Remove keyword from updates as it's now in triggerValue
    }

    const updatedTrigger = await databaseService.updateTrigger(id, updates);

    if (!updatedTrigger) {
      return null;
    }

    // Clear cache
    triggerCache.clear();

    logger.info(`Updated trigger ${id}`, { updates });
    
    return updatedTrigger;
  } catch (error) {
    logger.error('Error updating trigger:', error);
    throw error;
  }
}

/**
 * Delete a trigger
 */
async function deleteTrigger(id) {
  try {
    const deletedTrigger = await databaseService.deleteTrigger(id);
    
    if (!deletedTrigger) {
      return false;
    }

    // Clear cache
    triggerCache.clear();
    
    logger.info(`Deleted trigger: ${deletedTrigger.triggerId}`, {
      triggerId: deletedTrigger.id
    });
    
    return true;
  } catch (error) {
    logger.error('Error deleting trigger:', error);
    return false;
  }
}

/**
 * Find matching trigger for a message
 */
async function findMatchingTrigger(messageText) {
  const normalizedMessage = messageText.toLowerCase().trim();
  
  // Check cache first
  const cacheKey = `trigger:${normalizedMessage}`;
  let cachedResult = triggerCache.get(cacheKey);
  
  if (cachedResult !== null) {
    if (cachedResult) {
      // Update usage stats
      await updateTriggerUsage(cachedResult.id);
      logger.debug(`Trigger cache hit: "${cachedResult.triggerId}"`);
    }
    return cachedResult;
  }
  
  try {
    // Get active triggers from database
    const triggers = await databaseService.getTriggers({ 
      isActive: true,
      triggerType: 'KEYWORD_MATCH'
    });
    
    // Try exact match first (fastest)
    let matchingTrigger = triggers.find(trigger => {
      const keywords = trigger.triggerValue.keywords || [];
      return keywords.some(keyword => keyword === normalizedMessage);
    });
    
    // Fall back to substring matching (slower)
    if (!matchingTrigger) {
      matchingTrigger = triggers.find(trigger => {
        const keywords = trigger.triggerValue.keywords || [];
        return keywords.some(keyword => normalizedMessage.includes(keyword));
      });
    }
    
    if (matchingTrigger) {
      await updateTriggerUsage(matchingTrigger.id);
      
      // Cache the result
      triggerCache.set(cacheKey, matchingTrigger, 300); // 5 minutes
      
      logger.debug(`Trigger match found: "${matchingTrigger.triggerId}"`);
      return matchingTrigger;
    }

    // Cache negative result to avoid repeated lookups
    triggerCache.set(cacheKey, null, 60); // 1 minute for negative results
    
    logger.debug(`No matching trigger found for: "${messageText}"`);
    return null;
  } catch (error) {
    logger.error('Error finding matching trigger:', error);
    return null;
  }
}

/**
 * Update trigger usage statistics
 */
async function updateTriggerUsage(triggerId) {
  try {
    await databaseService.updateTriggerUsage(triggerId);
  } catch (error) {
    logger.error('Error updating trigger usage:', error);
  }
}

/**
 * Test trigger matching without actually sending
 */
async function testTrigger(message, phoneNumber) {
  try {
    const { simulateWebhook } = require('./webhookService');
    
    logger.debug(`Testing trigger with message: "${message}"`);
    
    const matchingTrigger = await findMatchingTrigger(message);
    const allActiveTriggers = await databaseService.getTriggers({ isActive: true });
    
    const result = {
      message,
      phoneNumber,
      matchingTrigger: matchingTrigger ? {
        id: matchingTrigger.id,
        triggerId: matchingTrigger.triggerId,
        triggerType: matchingTrigger.triggerType,
        triggerValue: matchingTrigger.triggerValue,
        flowId: matchingTrigger.flowId
      } : null,
      allActiveTriggers: allActiveTriggers.map(t => ({
        triggerId: t.triggerId,
        triggerType: t.triggerType,
        triggerValue: t.triggerValue,
        flowId: t.flowId
      })),
      timestamp: new Date().toISOString()
    };

    // Simulate the full webhook flow
    if (matchingTrigger) {
      try {
        await simulateWebhook(message, phoneNumber);
        result.simulationResult = 'success';
      } catch (error) {
        result.simulationResult = 'error';
        result.simulationError = error.message;
      }
    }

    return result;
  } catch (error) {
    logger.error('Error testing trigger:', error);
    throw error;
  }
}

module.exports = {
  getAllTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  findMatchingTrigger,
  testTrigger
};