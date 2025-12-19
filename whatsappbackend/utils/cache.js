const logger = require('./logger');

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
    
    this.stats.sets++;
    logger.verbose(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      logger.verbose(`Cache MISS: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.verbose(`Cache EXPIRED: ${key}`);
      return null;
    }

    this.stats.hits++;
    logger.verbose(`Cache HIT: ${key}`);
    return entry.value;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      logger.verbose(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache CLEARED: ${size} entries removed`);
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: ${cleaned} expired entries removed`);
    }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      memoryUsage: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    // Rough estimation of memory usage
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // String characters are 2 bytes
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 16; // Overhead for timestamps
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }
}

// Create different cache instances for different data types
const triggerCache = new MemoryCache();
const sessionCache = new MemoryCache();
const rateLimitCache = new MemoryCache();

module.exports = {
  triggerCache,
  sessionCache,
  rateLimitCache,
  MemoryCache
};