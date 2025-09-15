const NodeCache = require('node-cache');

// Create a cache instance with default TTL of 5 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 310 });

/**
 * Cache middleware for Express routes
 * @param {number} ttl - Time to live in seconds (optional, defaults to 300 seconds)
 * @returns {Function} Express middleware function
 */
function cacheMiddleware(ttl) {
  return (req, res, next) => {
    // Generate cache key from URL and query parameters
    const cacheKey = req.originalUrl || req.url;
    
    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      // Return cached response
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(cachedResponse);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, data, ttl);
      console.log(`Cached response for ${cacheKey}`);
      // Call the original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Invalidate cache for a specific key or pattern
 * @param {string} key - Cache key or pattern to invalidate
 */
function invalidateCache(key) {
  if (key.includes('*')) {
    // Handle pattern matching
    const keys = cache.keys();
    const matchingKeys = keys.filter(k => k.includes(key.replace('*', '')));
    cache.del(matchingKeys);
    console.log(`Invalidated cache for ${matchingKeys.length} keys matching pattern ${key}`);
  } else {
    // Invalidate specific key
    cache.del(key);
    console.log(`Invalidated cache for key ${key}`);
  }
}

/**
 * Clear all cache
 */
function clearCache() {
  cache.flushAll();
  console.log('Cache cleared');
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearCache
};