const logger = require('../utils/logger');
const { triggerCache } = require('../utils/cache');

// In-memory storage for triggers (use a database in production)
let triggers = [
  {
    id: '1',
    keyword: 'hello',
    flowId: 'your_flow_id_here',
    message: 'Hello! Please complete this form:',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    lastUsed: null
  },
  {
    id: '2',
    keyword: 'start',
    flowId: 'your_onboarding_flow_id',
    message: 'Welcome! Let\'s get you started:',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    lastUsed: null
  },
  {
    id: '3',
    keyword: 'contact',
    flowId: 'your_contact_flow_id',
    message: 'Please share your contact details:',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    lastUsed: null
  },
  {
    id: '4',
    keyword: 'feedback',
    flowId: 'your_feedback_flow_id',
    message: 'We\'d love to hear your feedback:',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    lastUsed: null
  }
];

// Create trigger lookup index for faster matching
let triggerIndex = new Map();
let indexLastUpdated = 0;

function updateTriggerIndex() {
  const now = Date.now();
  
  // Only rebuild index if triggers have been modified
  if (now - indexLastUpdated < 60000) { // 1 minute cache
    return;
  }
  
  triggerIndex.clear();
  
  // Sort triggers by usage count (most used first) for better performance
  const sortedTriggers = [...triggers]
    .filter(t => t.isActive)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  
  for (const trigger of sortedTriggers) {
    const keyword = trigger.keyword.toLowerCase();
    if (!triggerIndex.has(keyword)) {
      triggerIndex.set(keyword, []);
    }
    triggerIndex.get(keyword).push(trigger);
  }
  
  indexLastUpdated = now;
  logger.debug(`Trigger index updated: ${triggerIndex.size} keywords indexed`);
}

/**
 * Get all triggers
 */
function getAllTriggers() {
  return triggers.map(trigger => ({
    ...trigger,
    matchCount: trigger.usageCount || 0,
    lastUsed: trigger.lastUsed
  }));
}

/**
 * Create a new trigger
 */
function createTrigger(triggerData) {
  const newTrigger = {
    id: Date.now().toString(),
    keyword: triggerData.keyword.toLowerCase().trim(),
    flowId: triggerData.flowId,
    message: triggerData.message || 'Please complete this form:',
    isActive: triggerData.isActive !== false, // Default to true
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Validate required fields
  if (!newTrigger.keyword || !newTrigger.flowId) {
    throw new Error('Keyword and flowId are required');
  }

  // Check for duplicate keywords
  const existingTrigger = triggers.find(t => 
    t.keyword.toLowerCase() === newTrigger.keyword.toLowerCase()
  );
  
  if (existingTrigger) {
    throw new Error(`Trigger with keyword "${newTrigger.keyword}" already exists`);
  }

  triggers.push(newTrigger);
  
  // Invalidate cache
  indexLastUpdated = 0;
  triggerCache.clear();
  
  logger.info(`Created new trigger: "${newTrigger.keyword}"`, {
    flowId: newTrigger.flowId,
    triggerId: newTrigger.id
  });
  
  return newTrigger;
}

/**
 * Update an existing trigger
 */
function updateTrigger(id, updates) {
  const index = triggers.findIndex(t => t.id === id);
  
  if (index === -1) {
    return null;
  }

  // Validate keyword uniqueness if keyword is being updated
  if (updates.keyword) {
    const normalizedKeyword = updates.keyword.toLowerCase().trim();
    const existingTrigger = triggers.find(t => 
      t.id !== id && t.keyword.toLowerCase() === normalizedKeyword
    );
    
    if (existingTrigger) {
      throw new Error(`Trigger with keyword "${normalizedKeyword}" already exists`);
    }
    
    updates.keyword = normalizedKeyword;
  }

  triggers[index] = {
    ...triggers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Invalidate cache
  indexLastUpdated = 0;
  triggerCache.clear();

  logger.info(`Updated trigger ${id}`, { updates });
  
  return triggers[index];
}

/**
 * Delete a trigger
 */
function deleteTrigger(id) {
  const index = triggers.findIndex(t => t.id === id);
  
  if (index === -1) {
    return false;
  }

  const deletedTrigger = triggers.splice(index, 1)[0];
  
  // Invalidate cache
  indexLastUpdated = 0;
  triggerCache.clear();
  
  logger.info(`Deleted trigger: "${deletedTrigger.keyword}"`, {
    triggerId: deletedTrigger.id
  });
  
  return true;
}

/**
 * Find matching trigger for a message
 */
function findMatchingTrigger(messageText) {
  const normalizedMessage = messageText.toLowerCase().trim();
  
  // Check cache first
  const cacheKey = `trigger:${normalizedMessage}`;
  let cachedResult = triggerCache.get(cacheKey);
  
  if (cachedResult !== null) {
    if (cachedResult) {
      // Update usage stats
      updateTriggerUsage(cachedResult.id);
      logger.debug(`Trigger cache hit: "${cachedResult.keyword}"`);
    }
    return cachedResult;
  }
  
  // Update trigger index if needed
  updateTriggerIndex();
  
  // Try exact match first (fastest)
  if (triggerIndex.has(normalizedMessage)) {
    const exactMatches = triggerIndex.get(normalizedMessage);
    if (exactMatches.length > 0) {
      const trigger = exactMatches[0];
      updateTriggerUsage(trigger.id);
      
      // Cache the result
      triggerCache.set(cacheKey, trigger, 300); // 5 minutes
      
      logger.debug(`Exact trigger match: "${trigger.keyword}"`);
      return trigger;
    }
  }
  
  // Fall back to substring matching (slower)
  for (const [keyword, triggerList] of triggerIndex.entries()) {
    if (normalizedMessage.includes(keyword)) {
      const trigger = triggerList[0]; // First (most used) trigger
      updateTriggerUsage(trigger.id);
      
      // Cache the result
      triggerCache.set(cacheKey, trigger, 300);
      
      logger.debug(`Substring trigger match: "${trigger.keyword}"`);
      return trigger;
    }
  }

  // Cache negative result to avoid repeated lookups
  triggerCache.set(cacheKey, null, 60); // 1 minute for negative results
  
  logger.debug(`No matching trigger found for: "${messageText}"`);
  return null;
}

/**
 * Update trigger usage statistics
 */
function updateTriggerUsage(triggerId) {
  const trigger = triggers.find(t => t.id === triggerId);
  if (trigger) {
    trigger.usageCount = (trigger.usageCount || 0) + 1;
    trigger.lastUsed = new Date().toISOString();
    
    // Invalidate index to resort by usage
    if (trigger.usageCount % 10 === 0) { // Every 10 uses
      indexLastUpdated = 0;
    }
  }
}

/**
 * Test trigger matching without actually sending
 */
async function testTrigger(message, phoneNumber) {
  const { simulateWebhook } = require('./webhookService');
  
  logger.debug(`Testing trigger with message: "${message}"`);
  
  const matchingTrigger = findMatchingTrigger(message);
  
  const result = {
    message,
    phoneNumber,
    matchingTrigger: matchingTrigger ? {
      id: matchingTrigger.id,
      keyword: matchingTrigger.keyword,
      flowId: matchingTrigger.flowId,
      message: matchingTrigger.message
    } : null,
    allActiveTriggers: triggers.filter(t => t.isActive).map(t => ({
      keyword: t.keyword,
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
}

module.exports = {
  getAllTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  findMatchingTrigger,
  testTrigger
};