const { rateLimitCache } = require('./cache');
const logger = require('./logger');

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
  }

  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get current requests for this key
    let requests = rateLimitCache.get(key) || [];
    
    // Filter out old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    if (requests.length >= this.maxRequests) {
      logger.debug(`Rate limit exceeded for key: ${key}`, {
        requests: requests.length,
        limit: this.maxRequests,
        window: this.windowMs
      });
      return false;
    }

    // Add current request
    requests.push(now);
    
    // Store back in cache
    rateLimitCache.set(key, requests, Math.ceil(this.windowMs / 1000));
    
    return true;
  }

  getRemainingRequests(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    let requests = rateLimitCache.get(key) || [];
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - requests.length);
  }

  getResetTime(key) {
    const requests = rateLimitCache.get(key) || [];
    if (requests.length === 0) return null;
    
    const oldestRequest = Math.min(...requests);
    return new Date(oldestRequest + this.windowMs);
  }
}

// Create different rate limiters for different use cases
const webhookRateLimiter = new RateLimiter({
  windowMs: 60000,  // 1 minute
  maxRequests: 1000, // 1000 requests per minute
  keyGenerator: (req) => req.ip
});

const apiRateLimiter = new RateLimiter({
  windowMs: 60000,  // 1 minute
  maxRequests: 100,  // 100 requests per minute
  keyGenerator: (req) => req.ip
});

const whatsappRateLimiter = new RateLimiter({
  windowMs: 1000,   // 1 second
  maxRequests: 10,  // 10 messages per second (WhatsApp limit)
  keyGenerator: (phoneNumber) => phoneNumber
});

module.exports = {
  RateLimiter,
  webhookRateLimiter,
  apiRateLimiter,
  whatsappRateLimiter
};